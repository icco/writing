import fs from "node:fs/promises"
import path from "node:path"
import { canonicalPostUrl } from "../indieweb"
import { extractSnapshot, type SenderState } from "./state"

export async function runSender(options: { send: boolean; limit: number; post?: number; statePath: string }) {
  const postsRes = await fetch("https://writing.natwelch.com/posts.json")
  if (!postsRes.ok) throw new Error("Failed to fetch posts.json from production")
  const posts = (await postsRes.json()) as Array<{ id: number; permalink: string }>

  let state: SenderState = { version: 1, sources: {} }
  try {
    const raw = await fs.readFile(options.statePath, "utf-8")
    state = JSON.parse(raw)
  } catch {
    // start with empty state if missing or invalid
  }

  const selectedPosts = options.post !== undefined
    ? posts.filter(p => p.id === options.post)
    : posts.sort((a, b) => a.id - b.id)

  let operationsCount = 0
  for (const p of selectedPosts) {
    if (operationsCount >= options.limit) break
    const sourceUrl = canonicalPostUrl(p.permalink)
    try {
      const res = await fetch(sourceUrl)
      if (!res.ok) continue
      const html = await res.text()
      const snapshot = extractSnapshot(sourceUrl, html)
      
      if (!state.sources[sourceUrl]) state.sources[sourceUrl] = { targets: {} }
      const sourceState = state.sources[sourceUrl]

      for (const target of snapshot.targets) {
        if (operationsCount >= options.limit) break
        const record = sourceState.targets[target]
        const needsSend = !record || record.version !== snapshot.fingerprint || record.status === "failed"
        if (needsSend) {
          operationsCount++
          console.log(`${options.send ? "SENDING" : "DRY-RUN"} ${sourceUrl} -> ${target}`)
          if (options.send) {
            const result = await deliverWebmention(sourceUrl, target)
            sourceState.targets[target] = {
              version: snapshot.fingerprint,
              acceptedVersion: result.status === "accepted" ? snapshot.fingerprint : record?.acceptedVersion,
              operation: "present",
              attempts: (record?.attempts || 0) + 1,
              status: result.status,
              endpoint: result.endpoint,
              lastAttempt: new Date().toISOString(),
              retryAt: result.retryAt,
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Skipping source ${sourceUrl} due to error:`, err)
    }
  }

  if (options.send) {
    await fs.mkdir(path.dirname(options.statePath), { recursive: true })
    await fs.writeFile(options.statePath, JSON.stringify(state, null, 2) + "\n", "utf-8")
  }
}
