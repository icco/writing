import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, expect, test, vi } from "vitest"
import { runSender } from "./runner"
import * as network from "./network"
import * as discovery from "./discovery"
const directories: string[] = []
afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(
    directories.splice(0).map((dir) => rm(dir, { recursive: true }))
  )
})
async function statePath() {
  const dir = await mkdtemp(join(tmpdir(), "wm-test-"))
  directories.push(dir)
  return join(dir, "sent.json")
}
function sourceMock(
  permalink = "/post/1",
  body = '<article class="h-entry"><div class="e-content"><a href="https://example.com/a">Link</a><a href="https://example.com/b">Other</a></div></article>'
) {
  return vi.spyOn(network, "safeRequest").mockImplementation(async (url) => ({
    url,
    status: 200,
    headers: new Headers(),
    body: url.endsWith("posts.json")
      ? JSON.stringify([{ id: 1, permalink }])
      : body,
  }))
}

test("corrupt state aborts without delivering", async () => {
  const file = await statePath()
  await writeFile(file, "broken json")
  sourceMock()
  const delivery = vi.spyOn(discovery, "deliverWebmention")
  await expect(
    runSender({ send: true, limit: 10, statePath: file })
  ).rejects.toThrow()
  expect(delivery).not.toHaveBeenCalled()
})

test("dry-run does not discover endpoints or write state", async () => {
  const file = await statePath()
  const requests = sourceMock()
  const delivery = vi.spyOn(discovery, "deliverWebmention")
  await runSender({ send: false, limit: 1, statePath: file })
  expect(delivery).not.toHaveBeenCalled()
  expect(
    requests.mock.calls.every(([url]) =>
      url.startsWith("https://writing.natwelch.com/")
    )
  ).toBe(true)
  await expect(readFile(file)).rejects.toMatchObject({ code: "ENOENT" })
})

test("checkpoints each target and resumes a capped post", async () => {
  const file = await statePath()
  sourceMock()
  const delivery = vi
    .spyOn(discovery, "deliverWebmention")
    .mockResolvedValue({ status: "accepted" })
  await runSender({ send: true, limit: 1, statePath: file })
  expect(
    Object.keys(
      JSON.parse(await readFile(file, "utf8")).sources[
        "https://writing.natwelch.com/post/1"
      ].targets
    )
  ).toEqual(["https://example.com/a"])
  await runSender({ send: true, limit: 1, statePath: file })
  expect(delivery.mock.calls.map(([, target]) => target)).toEqual([
    "https://example.com/a",
    "https://example.com/b",
  ])
})

test("rejects off-origin source index before requesting a source", async () => {
  const requests = sourceMock("https://evil.example/post/1")
  await expect(
    runSender({ send: true, limit: 1, statePath: await statePath() })
  ).rejects.toThrow()
  expect(requests).toHaveBeenCalledTimes(1)
})

test("missing source markup preserves accepted state without sending removals", async () => {
  const file = await statePath()
  sourceMock()
  const delivery = vi
    .spyOn(discovery, "deliverWebmention")
    .mockResolvedValue({ status: "accepted" })
  await runSender({ send: true, limit: 1, statePath: file })
  const saved = await readFile(file, "utf8")
  sourceMock("/post/1", "<article>Maintenance</article>")
  await runSender({ send: true, limit: 10, statePath: file })
  expect(await readFile(file, "utf8")).toBe(saved)
  expect(delivery).toHaveBeenCalledTimes(1)
})

test.each([0, 1001, NaN])("invalid runner limit %s aborts", async (limit) => {
  await expect(
    runSender({ send: false, limit, statePath: await statePath() })
  ).rejects.toThrow("Limit")
})

test.each([
  { version: 2, sources: {} },
  { version: 1, sources: { a: {} } },
  { version: 1, sources: { a: { targets: { b: {} } } } },
  { version: 1, sources: { a: { targets: [] } } },
  {
    version: 1,
    sources: {
      a: {
        targets: {
          b: {
            version: "v1",
            operation: "present",
            status: "failed",
            attempts: 1,
            lastAttempt: "2026-01-01T00:00:00Z",
            retryAt: "not a date",
          },
        },
      },
    },
  },
])("invalid state schema aborts", async (state) => {
  const requests = sourceMock()
  const file = await statePath()
  await writeFile(file, JSON.stringify(state))
  await expect(
    runSender({ send: true, limit: 1, statePath: file })
  ).rejects.toThrow()
  expect(requests).not.toHaveBeenCalled()
})

test("non-200 index and non-array JSON abort", async () => {
  const file = await statePath()
  vi.spyOn(network, "safeRequest")
    .mockResolvedValueOnce({
      url: "https://writing.natwelch.com/posts.json",
      status: 503,
      headers: new Headers(),
      body: "",
    })
    .mockResolvedValueOnce({
      url: "https://writing.natwelch.com/posts.json",
      status: 200,
      headers: new Headers(),
      body: "{}",
    })
  await expect(
    runSender({ send: true, limit: 1, statePath: file })
  ).rejects.toThrow("index")
  await expect(
    runSender({ send: true, limit: 1, statePath: file })
  ).rejects.toThrow("index")
})

test("single-post selection skips other posts", async () => {
  const requests = sourceMock()
  await runSender({
    send: true,
    limit: 1,
    post: 2,
    statePath: await statePath(),
  })
  expect(requests).toHaveBeenCalledTimes(1)
})

test("failed operations checkpoint and stop at three attempts", async () => {
  sourceMock()
  const file = await statePath()
  const delivery = vi
    .spyOn(discovery, "deliverWebmention")
    .mockResolvedValue({ status: "failed", error: "offline" })
  for (let i = 0; i < 3; i++)
    await runSender({ send: true, limit: 10, statePath: file })
  expect(delivery).toHaveBeenCalledTimes(6)
  await runSender({ send: true, limit: 10, statePath: file })
  expect(delivery).toHaveBeenCalledTimes(6)
})

test("expired deadline stops cleanly before fetching sources", async () => {
  const file = await statePath()
  const requests = sourceMock()
  const delivery = vi.spyOn(discovery, "deliverWebmention")
  await runSender({
    send: true,
    limit: 10,
    statePath: file,
    deadline: Date.now() - 1,
  })
  expect(requests).toHaveBeenCalledTimes(1)
  expect(delivery).not.toHaveBeenCalled()
  await expect(readFile(file)).rejects.toMatchObject({ code: "ENOENT" })
})

test("deadline reached mid-post keeps completed checkpoints", async () => {
  const file = await statePath()
  sourceMock()
  let now = 1000
  vi.spyOn(Date, "now").mockImplementation(() => now)
  const delivery = vi
    .spyOn(discovery, "deliverWebmention")
    .mockImplementation(async () => {
      now = 2000
      return { status: "accepted" }
    })
  await runSender({ send: true, limit: 10, statePath: file, deadline: 1500 })
  expect(delivery).toHaveBeenCalledTimes(1)
  expect(
    Object.keys(
      JSON.parse(await readFile(file, "utf8")).sources[
        "https://writing.natwelch.com/post/1"
      ].targets
    )
  ).toEqual(["https://example.com/a"])
})

test("no-endpoint rechecks do not consume the failure budget", async () => {
  sourceMock()
  const file = await statePath()
  vi.spyOn(discovery, "deliverWebmention").mockResolvedValueOnce({
    status: "no-endpoint",
  })
  await runSender({ send: true, limit: 1, statePath: file })
  const state = JSON.parse(await readFile(file, "utf8"))
  const record =
    state.sources["https://writing.natwelch.com/post/1"].targets[
      "https://example.com/a"
    ]
  Object.assign(record, { attempts: 3, lastAttempt: "2020-01-01T00:00:00Z" })
  await writeFile(file, JSON.stringify(state))
  vi.spyOn(discovery, "deliverWebmention").mockResolvedValue({
    status: "failed",
    error: "offline",
  })
  await runSender({ send: true, limit: 1, statePath: file })
  expect(
    JSON.parse(await readFile(file, "utf8")).sources[
      "https://writing.natwelch.com/post/1"
    ].targets["https://example.com/a"]
  ).toMatchObject({ status: "failed", attempts: 1 })
})

test("interrupted runs resume after the last completed post", async () => {
  const file = await statePath()
  vi.spyOn(network, "safeRequest").mockImplementation(async (url) => ({
    url,
    status: 200,
    headers: new Headers(),
    body: url.endsWith("posts.json")
      ? JSON.stringify([
          { id: 1, permalink: "/post/1" },
          { id: 2, permalink: "/post/2" },
        ])
      : '<article class="h-entry"><div class="e-content"><a href="https://example.com/a">A</a><a href="https://example.com/b">B</a></div></article>',
  }))
  const delivery = vi
    .spyOn(discovery, "deliverWebmention")
    .mockResolvedValue({ status: "accepted" })
  await runSender({ send: true, limit: 3, statePath: file })
  expect(JSON.parse(await readFile(file, "utf8")).cursor).toBe(1)
  await runSender({ send: true, limit: 1, statePath: file })
  expect(delivery.mock.calls.at(-1)).toEqual([
    "https://writing.natwelch.com/post/2",
    "https://example.com/b",
  ])
  expect(JSON.parse(await readFile(file, "utf8")).cursor).toBe(2)
})
