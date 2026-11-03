import { describe, expect, test, vi } from "vitest"
import { discoverEndpoint, deliverWebmention } from "./discovery"
import * as network from "./network"

describe("endpoint discovery and delivery", () => {
  test("Link header precedes HTML and form contains exact source/target", async () => {
    vi.spyOn(network, "safeRequest").mockImplementation(async (url: string, init?: { method?: "GET" | "POST"; body?: string }) => {
      if (url === "https://example.com/post") {
        return { url, status: 200, headers: new Headers({ Link: '<https://example.com/wm>; rel="webmention"' }), body: "ok" }
      }
      if (url === "https://example.com/wm") {
        expect(init?.method).toBe("POST")
        expect(init?.body).toBe("source=https%3A%2F%2Fwriting.natwelch.com%2Fpost%2F1&target=https%3A%2F%2Fexample.com%2Fpost%23frag")
        return { url, status: 202, headers: new Headers(), body: "Accepted" }
      }
      return { url, status: 404, headers: new Headers(), body: "not found" }
    })
    const endpoint = await discoverEndpoint("https://example.com/post")
    expect(endpoint).toBe("https://example.com/wm")
    const result = await deliverWebmention("https://writing.natwelch.com/post/1", "https://example.com/post#frag")
    expect(result.status).toBe("accepted")
  })
})

