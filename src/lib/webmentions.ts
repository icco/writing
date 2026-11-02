import { BLOG_URL, canonicalPostUrl } from "./indieweb"

export type Reaction = {
  id: number
  kind: "likes" | "reposts" | "bookmarks" | "replies" | "mentions"
  url: string
  author: { name: string; url?: string; photo?: string }
  published?: string
  text: string
  name: string
}
export type ReactionGroups = Record<Reaction["kind"], Reaction[]>
export const emptyReactions = (): ReactionGroups => ({
  likes: [],
  reposts: [],
  bookmarks: [],
  replies: [],
  mentions: [],
})
const kinds: Record<string, Reaction["kind"]> = {
  "like-of": "likes",
  "repost-of": "reposts",
  "bookmark-of": "bookmarks",
  "in-reply-to": "replies",
  "mention-of": "mentions",
}
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === "string" ? value : "")
const date = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : undefined

export function safeWebUrl(value: unknown): string | undefined {
  try {
    const url = new URL(text(value))
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return
    return url.href
  } catch {
    return
  }
}

function normalize(value: unknown): Reaction | undefined {
  const item = record(value)
  if (item["wm-private"] || !Number.isSafeInteger(item["wm-id"])) return
  const property = text(item["wm-property"]) || "mention-of"
  const kind = Object.hasOwn(kinds, property) ? kinds[property] : undefined
  const url = safeWebUrl(item.url) || safeWebUrl(item["wm-source"])
  if (!kind || !url) return
  const author = record(item.author)
  const photo = safeWebUrl(author.photo)
  return {
    id: item["wm-id"] as number,
    kind,
    url,
    author: {
      name: text(author.name).trim() || "Anonymous",
      url: safeWebUrl(author.url),
      photo:
        photo && new URL(photo).origin === "https://avatars.webmention.io"
          ? photo
          : undefined,
    },
    published: date(item.published) || date(item["wm-received"]),
    text: text(record(item.content).text),
    name: text(item.name),
  }
}

export async function getWebmentions(
  id: number,
  permalink: string
): Promise<ReactionGroups> {
  const groups = emptyReactions()
  const signal = AbortSignal.timeout(3000)
  try {
    const seen = new Set<number>()
    let pages = 1
    for (let page = 0; page < pages; page++) {
      const url = new URL("https://webmention.io/api/mentions.jf2")
      for (const target of [
        canonicalPostUrl(permalink),
        `${BLOG_URL}/${id}`,
        `${BLOG_URL}/posts/${id}`,
      ])
        url.searchParams.append("target[]", target)
      url.searchParams.set("per-page", "1000")
      url.searchParams.set("page", String(page))
      url.searchParams.set("sort-dir", "up")
      const response = await fetch(url.href, {
        next: { revalidate: 3600 },
        signal,
      })
      if (!response.ok) throw new Error(`Webmention API: ${response.status}`)
      const data = record(await response.json())
      if (!Array.isArray(data.children))
        throw new Error("Invalid webmention snapshot")
      const totalPages = record(data.paging)["total-pages"]
      if (
        typeof totalPages !== "number" ||
        !Number.isInteger(totalPages) ||
        totalPages < 0 ||
        totalPages > 10
      )
        throw new Error("Incomplete webmention pagination")
      pages = totalPages
      for (const raw of data.children) {
        const reaction = normalize(raw)
        if (!reaction || seen.has(reaction.id)) continue
        seen.add(reaction.id)
        groups[reaction.kind].push(reaction)
      }
    }
    for (const kind of ["replies", "mentions"] as const)
      groups[kind].sort(
        (a, b) =>
          (a.published || "").localeCompare(b.published || "") || a.id - b.id
      )
    return groups
  } catch (error) {
    console.warn("Unable to load webmentions", error)
    return emptyReactions()
  }
}
