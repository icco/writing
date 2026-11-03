import { afterEach, describe, expect, test, vi } from "vitest"
import { isIpAllowed, safeRequest } from "./network"

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

import dns from "node:dns/promises"
import http from "node:http"
import https from "node:https"
import { EventEmitter } from "node:events"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function transport(
  replies: Array<{
    status?: number
    headers?: Record<string, string | string[]>
    chunks?: Buffer[]
    error?: string
    requestError?: string
  }> = [{}]
) {
  vi.spyOn(dns, "lookup").mockResolvedValue([
    { address: "8.8.8.8", family: 4 },
  ] as never)
  const urls: string[] = []
  const mock = vi.fn((url, options, callback) => {
    urls.push(url.href)
    const reply = replies.shift() || {}
    const req = new EventEmitter() as EventEmitter & {
      end: ReturnType<typeof vi.fn>
      destroy: ReturnType<typeof vi.fn>
    }
    req.destroy = vi.fn((error) => {
      req.emit("error", error)
    })
    req.end = vi.fn(() => {
      options.lookup(
        "example.com",
        {},
        (error: Error | null, address: string, family: number) => {
          expect(error).toBeNull()
          expect(address).toBe("8.8.8.8")
          expect(family).toBe(4)
        }
      )
      queueMicrotask(() => {
        if (reply.requestError) {
          req.emit("error", new Error(reply.requestError))
          return
        }
        const res = Object.assign(new EventEmitter(), {
          statusCode: reply.status,
          headers: reply.headers || {},
        })
        callback(res)
        if (reply.error) {
          res.emit("error", new Error(reply.error))
          return
        }
        for (const chunk of reply.chunks || []) res.emit("data", chunk)
        res.emit("end")
      })
    })
    return req
  })
  vi.spyOn(https, "request").mockImplementation(mock as never)
  vi.spyOn(http, "request").mockImplementation(mock as never)
  return { mock, urls }
}

test("pins validated DNS and follows redirects with a final response URL", async () => {
  const { urls, mock } = transport([
    { status: 301, headers: { location: "https://example.com/new" } },
    {
      status: 200,
      headers: { "content-type": "text/html", "set-cookie": ["a", "b"] },
      chunks: [Buffer.from("Hi")],
    },
  ])
  const response = await safeRequest("http://example.com/start", {
    method: "POST",
    body: "a=b",
  })
  expect(urls).toEqual(["http://example.com/start", "https://example.com/new"])
  expect(response).toMatchObject({
    url: "https://example.com/new",
    status: 200,
    body: "Hi",
  })
  expect(mock.mock.calls[1][1].method).toBe("GET")
  expect(mock.mock.calls[1][1].headers.Authorization).toBeUndefined()
})

test("307 preserves the POST body", async () => {
  const { mock } = transport([
    { status: 307, headers: { location: "/new" } },
    { status: 202 },
  ])
  await safeRequest("https://example.com/start", {
    method: "POST",
    body: "a=b",
  })
  expect(mock.mock.calls[1][1].method).toBe("POST")
})

test("blocks mixed private DNS answers and revalidates redirect destinations", async () => {
  const { mock } = transport([
    { status: 302, headers: { location: "http://127.0.0.2/" } },
  ])
  await expect(safeRequest("https://example.com")).rejects.toThrow("Blocked")
  expect(mock).toHaveBeenCalledTimes(1)
  vi.mocked(dns.lookup).mockResolvedValue([
    { address: "8.8.8.8", family: 4 },
    { address: "127.0.0.1", family: 4 },
  ] as never)
  await expect(safeRequest("https://example.com")).rejects.toThrow("Blocked")
})

test("blocks empty DNS and malformed addresses", async () => {
  transport()
  vi.mocked(dns.lookup).mockResolvedValue([] as never)
  await expect(safeRequest("https://example.com")).rejects.toThrow("Blocked")
  expect(isIpAllowed("not an address")).toBe(false)
})

test("limits redirects to five hops", async () => {
  const { mock } = transport(
    Array.from({ length: 6 }, () => ({
      status: 302,
      headers: { location: "/again" },
    }))
  )
  await expect(safeRequest("https://example.com")).rejects.toThrow(
    "Too many redirects"
  )
  expect(mock).toHaveBeenCalledTimes(6)
})

test.each([
  { error: "stream failed" },
  { requestError: "request failed" },
  { chunks: [Buffer.alloc(2 * 1024 * 1024 + 1)] },
])("rejects failed or oversized responses", async (reply) => {
  transport([reply])
  await expect(safeRequest("https://example.com")).rejects.toThrow()
})

test("absolute deadline includes a hung DNS lookup", async () => {
  const controller = new AbortController()
  vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal)
  vi.spyOn(dns, "lookup").mockImplementation(
    () => new Promise(() => {}) as never
  )
  const pending = expect(safeRequest("https://example.com")).rejects.toThrow()
  controller.abort(new Error("deadline"))
  await pending
})
