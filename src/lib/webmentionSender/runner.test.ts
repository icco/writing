import { describe, expect, test, vi } from "vitest"
import { runSender } from "./runner"
import fs from "node:fs/promises"

describe("sender runner", () => {
  test("dry-run does not write state or send network requests", async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/posts.json")) {
        return { ok: true, json: async () => [{ id: 1, permalink: "/post/1" }] }
      }
      return { ok: true, text: async () => "<div class='e-content'><a href='https://example.com/a'>Link</a></div>" }
    })
    vi.stubGlobal("fetch", fetcher)
    const writeFileSpy = vi.spyOn(fs, "writeFile")

    await runSender({ send: false, limit: 10, statePath: "webmentions/sent.json" })
    expect(writeFileSpy).not.toHaveBeenCalled()
  })
})
