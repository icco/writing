import fs from "node:fs/promises"
import path from "node:path"
import writeFileAtomic from "write-file-atomic"
import { BLOG_URL } from "../indieweb"
import { deliverWebmention } from "./discovery"
import { safeRequest } from "./network"
import { extractSnapshot, planOperations, type SenderState } from "./state"
import { postIndexSchema, senderStateSchema } from "./schemas"

async function loadState(file: string): Promise<SenderState> {
  let raw: string
  try {
    raw = await fs.readFile(file, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { version: 1, sources: {} }
    throw error
  }
  return senderStateSchema.parse(JSON.parse(raw))
}

async function saveState(file: string, state: SenderState) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await writeFileAtomic(
    file,
    JSON.stringify(
      state,
      (_key, value) =>
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.fromEntries(
              Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
            )
          : value,
      2
    ) + "\n"
  )
}

export async function runSender(options: {
  send: boolean
  limit: number
  post?: number
  statePath: string
  deadline?: number
}): Promise<void> {
  if (
    !Number.isInteger(options.limit) ||
    options.limit < 1 ||
    options.limit > 1000
  )
    throw new Error("Limit must be an integer from 1 to 1000")
  const state = await loadState(options.statePath)
  const index = await safeRequest(`${BLOG_URL}/posts.json`)
  if (index.status !== 200 || index.url !== `${BLOG_URL}/posts.json`)
    throw new Error("Invalid production post index")
  const parsed = postIndexSchema.safeParse(JSON.parse(index.body))
  if (!parsed.success)
    throw new Error("Invalid production post index", { cause: parsed.error })
  const validated = parsed.data
    .map((post) => ({ id: post.id, source: `${BLOG_URL}${post.permalink}` }))
    .sort((a, b) => a.id - b.id)
  const expired = () => {
    if (options.deadline === undefined || Date.now() < options.deadline)
      return false
    console.log("Time budget reached; stopping")
    return true
  }
  let count = 0
  for (const post of validated) {
    if (options.post !== undefined && options.post !== post.id) continue
    if (count >= options.limit || expired()) return
    let snapshot
    try {
      const response = await safeRequest(post.source)
      if (response.status !== 200 || response.url !== post.source)
        throw new Error("Source unavailable or redirected")
      snapshot = extractSnapshot(post.source, response.body)
    } catch (error) {
      console.warn(`Skipping ${post.source}`, error)
      continue
    }
    for (const operation of planOperations(snapshot, state, new Date())) {
      if (expired()) return
      if (count++ >= options.limit) break
      console.log(
        `${options.send ? "SEND" : "DRY-RUN"} ${operation.source} -> ${operation.target} (${operation.operation})`
      )
      if (!options.send) continue
      const result = await deliverWebmention(operation.source, operation.target)
      const source = (state.sources[post.source] ||= { targets: {} })
      const previous = source.targets[operation.target]
      source.targets[operation.target] = {
        ...result,
        version: operation.version,
        operation: operation.operation,
        acceptedVersion:
          result.status === "accepted"
            ? operation.version
            : previous?.acceptedVersion,
        attempts:
          previous?.version === operation.version &&
          previous.operation === operation.operation
            ? previous.attempts + 1
            : 1,
        lastAttempt: new Date().toISOString(),
      }
      await saveState(options.statePath, state)
      if (result.status === "failed")
        console.warn(
          `Delivery failed: ${operation.target}: ${result.error}; attempt ${source.targets[operation.target].attempts}/3`
        )
    }
  }
}
