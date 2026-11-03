import crypto from "node:crypto"
import { JSDOM } from "jsdom"
import { BLOG_URL, canonicalPostUrl } from "../indieweb"

export type SourceSnapshot = {
  source: string
  fingerprint: string
  targets: string[]
}

export type DeliveryRecord = {
  version: string
  acceptedVersion?: string
  operation: "present" | "removed"
  attempts: number
  status: "accepted" | "no-endpoint" | "failed"
  endpoint?: string
  lastAttempt: string
  retryAt?: string
}

export type SenderState = {
  version: 1
  sources: Record<string, { targets: Record<string, DeliveryRecord> }>
}

export function extractSnapshot(sourceUrl: string, html: string): SourceSnapshot {
  const dom = new JSDOM(html, { url: sourceUrl })
  const doc = dom.window.document
  const article = doc.querySelector(".h-entry") || doc.querySelector("article") || doc.body
  const contentEl = article.querySelector(".e-content") || article
  const text = contentEl.textContent || ""
  if (!text.trim()) {
    throw new Error(`Empty e-content found for source ${sourceUrl}`)
  }

  const targets = new Set<string>()
  const anchors = contentEl.querySelectorAll("a[href]")
  for (const a of anchors) {
    const href = a.getAttribute("href")
    if (!href) continue
    try {
      const resolved = new URL(href, sourceUrl)
      resolved.hash = ""
      if (!["http:", "https:"].includes(resolved.protocol)) continue
      if (resolved.hostname === new URL(BLOG_URL).hostname) continue
      targets.add(resolved.href)
    } catch {
      // ignore invalid URLs
    }
  }

  const hash = crypto.createHash("sha256").update(text).digest("hex")
  return {
    source: sourceUrl,
    fingerprint: hash,
    targets: Array.from(targets).sort(),
  }
}
