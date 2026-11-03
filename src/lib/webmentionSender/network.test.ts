import { afterEach, describe, expect, test, vi } from "vitest"
import { isIpAllowed, safeRequest } from "./network"
import dns from "node:dns/promises"
import nock from "nock"
import { gzipSync } from "node:zlib"

afterEach(() => {
  vi.restoreAllMocks()
  nock.cleanAll()
  nock.enableNetConnect()
})

function publicDns() {
  nock.disableNetConnect()
  vi.spyOn(dns, "lookup").mockResolvedValue([
    { address: "8.8.8.8", family: 4 },
  ] as never)
}

test("Got follows redirects and decompresses responses", async () => {
  publicDns()
  nock("https://example.com")
    .get("/start")
    .reply(302, "", { location: "/final" })
    .get("/final")
    .reply(200, gzipSync("Hello"), {
      "content-type": "text/html",
      "content-encoding": "gzip",
    })
  expect(await safeRequest("https://example.com/start")).toMatchObject({
    url: "https://example.com/final",
    status: 200,
    body: "Hello",
  })
})

test("redirects to local addresses are blocked", async () => {
  publicDns()
  nock("https://example.com")
    .get("/")
    .reply(302, "", { location: "http://127.0.0.2/" })
  await expect(safeRequest("https://example.com/")).rejects.toThrow(/Blocked/)
})

test("mixed public and private DNS is rejected", async () => {
  publicDns()
  vi.mocked(dns.lookup).mockResolvedValue([
    { address: "8.8.8.8", family: 4 },
    { address: "127.0.0.1", family: 4 },
  ] as never)
  await expect(safeRequest("https://example.com/")).rejects.toThrow(/Blocked/)
})

test("POST redirects preserve payload and do not forward caller credentials", async () => {
  publicDns()
  nock("https://example.com", { badheaders: ["authorization", "cookie"] })
    .post("/start", { source: "a", target: "b" })
    .reply(307, "", { location: "/final" })
    .post("/final", { source: "a", target: "b" })
    .reply(202, "Accepted")
  expect(
    (
      await safeRequest("https://example.com/start", {
        method: "POST",
        body: "source=a&target=b",
        headers: { Authorization: "secret" },
      })
    ).status
  ).toBe(202)
})

test("redirect loops and stream failures reject without retries", async () => {
  publicDns()
  nock("https://example.com")
    .get("/loop")
    .times(6)
    .reply(302, "", { location: "/loop" })
  await expect(safeRequest("https://example.com/loop")).rejects.toThrow()
  nock("https://example.com").get("/error").replyWithError("stream failed")
  await expect(safeRequest("https://example.com/error")).rejects.toThrow(
    "stream failed"
  )
})

test("responses remain bounded and HTTP failures do not retry", async () => {
  publicDns()
  nock("https://example.com")
    .get("/large")
    .reply(200, Buffer.alloc(2 * 1024 * 1024 + 1))
  await expect(safeRequest("https://example.com/large")).rejects.toThrow(
    /2 MiB/
  )
  const scope = nock("https://example.com").get("/failure").reply(503, "Busy")
  expect((await safeRequest("https://example.com/failure")).status).toBe(503)
  expect(scope.isDone()).toBe(true)
})

test("hung DNS respects the absolute deadline", async () => {
  const controller = new AbortController()
  vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal)
  vi.spyOn(dns, "lookup").mockImplementation(
    () => new Promise(() => {}) as never
  )
  const result = expect(safeRequest("https://example.com/")).rejects.toThrow()
  controller.abort(new Error("deadline"))
  await result
})

describe("IP safety and SSRF prevention", () => {
  test.each([
    "127.0.0.2",
    "::ffff:7f00:1",
    "fe90::1",
    "224.0.0.1",
    "100.64.0.1",
    "192.0.2.1",
    "::",
    "2001:db8::1",
  ])("blocks reserved range %s", (ip) => {
    expect(isIpAllowed(ip)).toBe(false)
  })
  test.each([
    "127.0.0.1",
    "10.0.0.1",
    "192.168.1.1",
    "172.16.0.1",
    "169.254.169.254",
    "0.0.0.0",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ])("rejects reserved or private IP %s", (ip) => {
    expect(isIpAllowed(ip)).toBe(false)
  })

  test.each(["8.8.8.8", "1.1.1.1", "2607:f8b0:4004:c07::64"])(
    "allows public IP %s",
    (ip) => {
      expect(isIpAllowed(ip)).toBe(true)
    }
  )

  test("rejects credentials, non-http protocols and nonstandard ports", async () => {
    await expect(safeRequest("ftp://example.com/file")).rejects.toThrow()
    await expect(
      safeRequest("https://user:pass@example.com/")
    ).rejects.toThrow()
    await expect(safeRequest("https://example.com:8443/")).rejects.toThrow()
  })
})
