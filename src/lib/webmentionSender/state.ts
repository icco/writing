import { createHash } from "node:crypto"
import { JSDOM } from "jsdom"
import { BLOG_URL } from "../indieweb"
import type { z } from "zod"
import type { deliveryRecordSchema, senderStateSchema } from "./schemas"
export type SourceSnapshot = {
  source: string
  fingerprint: string
  targets: string[]
}
export type DeliveryRecord = z.infer<typeof deliveryRecordSchema>
export type SenderState = z.infer<typeof senderStateSchema>
export type Operation = {
  source: string
  target: string
  version: string
  operation: "present" | "removed"
}

export function extractSnapshot(source: string, html: string): SourceSnapshot {
  const dom = new JSDOM(html, { url: source })
  try {
    const entries = dom.window.document.querySelectorAll("article.h-entry")
    if (entries.length !== 1) throw new Error("Missing or ambiguous post entry")
    const entry = entries[0]
    const bodies = entry.querySelectorAll(".e-content")
    if (bodies.length !== 1)
      throw new Error("Missing or ambiguous post content")
    const body = bodies[0]
    const targets = new Set<string>()
    for (const anchor of body.querySelectorAll("a[href]")) {
      try {
        const url = new URL(anchor.getAttribute("href")!, source)
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.hostname === new URL(BLOG_URL).hostname
        )
          continue
        targets.add(url.href)
      } catch {
        continue
      }
    }
    const fields = [
      ".p-name",
      ".dt-published",
      ".p-summary",
      ".p-category",
    ].map((selector) =>
      Array.from(entry.querySelectorAll(selector))
        .filter(
          (el) => el.closest(".h-entry") === entry && !el.closest(".h-cite")
        )
        .map(
          (el) =>
            el.getAttribute("datetime") ||
            el.getAttribute("value") ||
            el.textContent
        )
    )
    const fingerprint = createHash("sha256")
      .update(JSON.stringify([body.innerHTML, fields]))
      .digest("hex")
    return { source, fingerprint, targets: [...targets].sort() }
  } finally {
    dom.window.close()
  }
}

export function planOperations(
  snapshot: SourceSnapshot,
  state: SenderState,
  now: Date
): Operation[] {
  const saved = state.sources[snapshot.source]?.targets || {}
  const present = new Set(snapshot.targets)
  const operations: Operation[] = []
  for (const target of new Set([...snapshot.targets, ...Object.keys(saved)])) {
    const record = saved[target]
    const operation = present.has(target) ? "present" : "removed"
    if (operation === "removed" && !record?.acceptedVersion) continue
    const version = operation === "present" ? snapshot.fingerprint : "removed"
    const same = record?.version === version && record.operation === operation
    if (
      same &&
      (record.status === "accepted" ||
        (record.status === "failed" &&
          (record.attempts >= 3 ||
            Date.parse(record.retryAt || "") > now.getTime())) ||
        (record.status === "no-endpoint" &&
          now.getTime() - Date.parse(record.lastAttempt) < 90 * 86400000))
    )
      continue
    operations.push({ source: snapshot.source, target, operation, version })
  }
  return operations
}
