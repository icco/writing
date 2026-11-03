import { describe, expect, test, vi } from "vitest"
import { discoverEndpoint, deliverWebmention } from "./discovery"
import * as network from "./network"

describe("endpoint discovery and delivery", () => {
  test.each([
    "</wm>; rel=webmention",
    '</wm>; type="text/plain"; rel="alternate webmention"',
  ])("discovers header %s", async (header) => {
    vi.spyOn(network, "safeRequest").mockResolvedValue({
      url: "https://example.com/final",
      status: 200,
      headers: new Headers({ Link: header }),
      body: "",
    })
    expect(await discoverEndpoint("https://example.com/start")).toBe(
      "https://example.com/wm"
    )
  })

  test("transient discovery errors remain failures", async () => {
    vi.spyOn(network, "safeRequest").mockRejectedValue(new Error("offline"))
    expect(
      (
        await deliverWebmention(
          "https://writing.natwelch.com/post/1",
          "https://example.com"
        )
      ).status
    ).toBe("failed")
  })

  test("does not parse plain-text examples as endpoints", async () => {
    vi.spyOn(network, "safeRequest").mockResolvedValue({
      url: "https://example.com/",
      status: 200,
      headers: new Headers({ "content-type": "text/plain" }),
      body: '<a rel="webmention" href="/wm">Example</a>',
    })
    expect(await discoverEndpoint("https://example.com/")).toBeNull()
  })
  test("Link header precedes HTML and form contains exact source/target", async () => {
    const spy = vi
      .spyOn(network, "safeRequest")
      .mockImplementation(
        async (
          url: string,
          init?: { method?: "GET" | "POST"; body?: string }
        ) => {
          if (url === "https://example.com/post") {
            return {
              url,
              status: 200,
              headers: new Headers({
                Link: '<https://example.com/wm>; rel="webmention"',
              }),
              body: "ok",
            }
          }
          if (url === "https://example.com/wm") {
            expect(init?.method).toBe("POST")
            expect(init?.body).toBe(
              "source=https%3A%2F%2Fwriting.natwelch.com%2Fpost%2F1&target=https%3A%2F%2Fexample.com%2Fpost%23frag"
            )
            return {
              url,
              status: 202,
              headers: new Headers(),
              body: "Accepted",
            }
          }
          return { url, status: 404, headers: new Headers(), body: "not found" }
        }
      )
    const endpoint = await discoverEndpoint("https://example.com/post")
    expect(endpoint).toBe("https://example.com/wm")
    spy.mockRestore()
    vi.spyOn(network, "safeRequest").mockImplementation(
      async (
        url: string,
        init?: { method?: "GET" | "POST"; body?: string }
      ) => {
        if (url === "https://example.com/wm") {
          expect(init?.method).toBe("POST")
          expect(init?.body).toBe(
            "source=https%3A%2F%2Fwriting.natwelch.com%2Fpost%2F1&target=https%3A%2F%2Fexample.com%2Fpost%23frag"
          )
          return { url, status: 202, headers: new Headers(), body: "Accepted" }
        }
        return {
          url,
          status: 200,
          headers: new Headers({
            Link: '<https://example.com/wm>; rel="webmention"',
          }),
          body: "ok",
        }
      }
    )
    const result = await deliverWebmention(
      "https://writing.natwelch.com/post/1",
      "https://example.com/post#frag"
    )
    expect(result.status).toBe("accepted")
  })
})

test("HTML discovery resolves empty and relative hrefs against final URL", async () => {
  vi.spyOn(network, "safeRequest").mockResolvedValue({
    url: "https://example.com/final",
    status: 200,
    headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
    body: '<a rel="webmention" href="">Endpoint</a>',
  })
  expect(await discoverEndpoint("https://example.com/start")).toBe(
    "https://example.com/final"
  )
})

test("non-2xx discovery is retryable and valid HTML without links has no endpoint", async () => {
  vi.spyOn(network, "safeRequest")
    .mockResolvedValueOnce({
      url: "https://example.com/",
      status: 503,
      headers: new Headers(),
      body: "",
    })
    .mockResolvedValueOnce({
      url: "https://example.com/",
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      body: "<p>Nothing</p>",
    })
  expect(
    (
      await deliverWebmention(
        "https://writing.natwelch.com/post/1",
        "https://example.com/"
      )
    ).status
  ).toBe("failed")
  expect(await discoverEndpoint("https://example.com/")).toBeNull()
})

test.each(["3600", "Tue, 03 Nov 2026 14:00:00 GMT", "bad"])(
  "records receiver retry policy %s",
  async (retry) => {
    vi.spyOn(network, "safeRequest")
      .mockResolvedValueOnce({
        url: "https://example.com/",
        status: 200,
        headers: new Headers({ Link: '</wm>; rel="webmention"' }),
        body: "",
      })
      .mockResolvedValueOnce({
        url: "https://example.com/wm",
        status: 429,
        headers: new Headers({ "retry-after": retry }),
        body: "",
      })
    const result = await deliverWebmention(
      "https://writing.natwelch.com/post/1",
      "https://example.com/"
    )
    expect(result.status).toBe("failed")
    expect(Boolean(result.retryAt)).toBe(retry !== "bad")
  }
)

test("successful page without endpoint is distinct from failures", async () => {
  vi.spyOn(network, "safeRequest").mockResolvedValue({
    url: "https://example.com/",
    status: 200,
    headers: new Headers(),
    body: "",
  })
  expect(
    (
      await deliverWebmention(
        "https://writing.natwelch.com/post/1",
        "https://example.com/"
      )
    ).status
  ).toBe("no-endpoint")
})
