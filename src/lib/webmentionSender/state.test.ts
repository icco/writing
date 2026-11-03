import { expect, test } from "vitest"
import { extractSnapshot, planOperations, type SenderState } from "./state"
const source = "https://writing.natwelch.com/post/1"
const target = "https://example.com/page#item"
const html = (href = target, title = "Title") =>
  `<article class="h-entry"><h1 class="p-name">${title}</h1><div class="e-content"><a href="${href}">Link</a></div></article>`

test("preserves target fragments and detects href and metadata edits", () => {
  const snapshot = extractSnapshot(source, html())
  expect(snapshot.targets).toEqual([target])
  expect(
    extractSnapshot(source, html("https://example.com/other")).fingerprint
  ).not.toBe(snapshot.fingerprint)
  expect(extractSnapshot(source, html(target, "New")).fingerprint).not.toBe(
    snapshot.fingerprint
  )
  expect(
    extractSnapshot(source, `${html()}<nav>Changed</nav>`).fingerprint
  ).toBe(snapshot.fingerprint)
})

test.each([
  "<article>Maintenance</article>",
  '<div class="e-content">Outside</div>',
  html() + html(),
])("rejects missing or ambiguous entry content", (value) => {
  expect(() => extractSnapshot(source, value)).toThrow()
})

test("per-target retries, removal tombstones and readdition", () => {
  const now = new Date("2026-01-01Z")
  const snapshot = extractSnapshot(source, html())
  const state: SenderState = { version: 1, sources: {} }
  const operation = planOperations(snapshot, state, now)[0]
  state.sources[source] = {
    targets: {
      [target]: {
        version: operation.version,
        operation: "present",
        status: "failed",
        attempts: 3,
        lastAttempt: now.toISOString(),
      },
    },
  }
  expect(planOperations(snapshot, state, now)).toEqual([])
  state.sources[source].targets[target].attempts = 1
  state.sources[source].targets[target].retryAt = "2026-01-02T00:00:00Z"
  expect(planOperations(snapshot, state, now)).toEqual([])
  const record = state.sources[source].targets[target]
  record.status = "accepted"
  record.acceptedVersion = record.version
  const removed = { ...snapshot, targets: [] }
  const removal = planOperations(removed, state, now)[0]
  expect(removal.operation).toBe("removed")
  record.operation = "removed"
  record.version = removal.version
  record.status = "accepted"
  expect(
    planOperations({ ...removed, fingerprint: "new" }, state, now)
  ).toEqual([])
  expect(planOperations(snapshot, state, now)[0].operation).toBe("present")
})

test("rechecks no-endpoint after 90 days and resets failed attempts for new versions", () => {
  const snapshot = extractSnapshot(source, html())
  const state: SenderState = { version: 1, sources: {} }
  const op = planOperations(snapshot, state, new Date())[0]
  state.sources[source] = {
    targets: {
      [target]: {
        version: op.version,
        status: "no-endpoint",
        attempts: 1,
        operation: "present",
        lastAttempt: "2026-01-01T00:00:00Z",
      },
    },
  }
  expect(planOperations(snapshot, state, new Date("2026-01-02Z"))).toEqual([])
  expect(planOperations(snapshot, state, new Date("2026-05-01Z"))).toHaveLength(
    1
  )
  expect(
    planOperations(
      { ...snapshot, fingerprint: "new" },
      state,
      new Date("2026-01-02Z")
    )
  ).toHaveLength(1)
})

test("receiver retry delays apply to new source versions", () => {
  const now = new Date("2026-01-01Z")
  const snapshot = extractSnapshot(source, html())
  const state: SenderState = {
    version: 1,
    sources: {
      [source]: {
        targets: {
          [target]: {
            version: "old",
            operation: "present",
            status: "failed",
            attempts: 1,
            lastAttempt: now.toISOString(),
            retryAt: "2026-01-02T00:00:00Z",
          },
        },
      },
    },
  }
  expect(planOperations(snapshot, state, now)).toEqual([])
  expect(planOperations(snapshot, state, new Date("2026-01-03Z"))).toHaveLength(
    1
  )
})
