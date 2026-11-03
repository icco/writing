import { spawnSync } from "node:child_process"
import { expect, test } from "vitest"

test.each(["--limit=bad", "--limit=0", "--limit=1001", "--post=bad"])(
  "rejects invalid CLI input %s before network work",
  (option) => {
    const result = spawnSync(
      "node",
      ["--import", "tsx", "scripts/send-webmentions.ts", option],
      { encoding: "utf8" }
    )
    expect(result.status).not.toBe(0)
    expect(result.stderr).toMatch(/must be|invalid/i)
    expect(result.stdout).not.toContain("Starting")
  }
)

test("help loads the actual runner without doing network work", () => {
  const result = spawnSync(
    "node",
    ["--import", "tsx", "scripts/send-webmentions.ts", "--help"],
    { encoding: "utf8" }
  )
  expect(result.status).toBe(0)
  expect(result.stdout).toContain("--limit")
})
