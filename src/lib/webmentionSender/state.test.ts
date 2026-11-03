import { describe, expect, test } from "vitest"
import { extractSnapshot } from "./state"

describe("sender state and snapshot extraction", () => {
  test("extracts anchors only from e-content and strips fragments / self-links", () => {
    const html = `
      <html><body>
        <nav><a href="https://example.com/nav">Nav</a></nav>
        <div class="e-content">
          <p>Hello <a href="https://example.com/target#frag">Target</a> and <a href="https://writing.natwelch.com/post/1">Self</a></p>
        </div>
      </body></html>
    `
    const snap = extractSnapshot("https://writing.natwelch.com/post/1", html)
    expect(snap.targets).toEqual(["https://example.com/target"])
    expect(snap.fingerprint).toHaveLength(64)
  })

  test("throws on missing e-content text", () => {
    expect(() => extractSnapshot("https://writing.natwelch.com/post/1", "<html><body><div class='e-content'>   </div></body></html>")).toThrow()
  })
})
