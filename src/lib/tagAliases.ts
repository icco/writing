import pluralize from "pluralize"

export const tagAliases: Record<string, string> = {
}

let existingTagsCache: Set<string> | null = null

function getExistingTags(): Set<string> | null {
  if (existingTagsCache !== null) return existingTagsCache

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { allPosts } = require("contentlayer/generated")
    if (!allPosts) return null

    existingTagsCache = new Set<string>()
    for (const post of allPosts) {
      if (post.tags) {
        for (const tag of post.tags) {
          existingTagsCache.add(tag.toLowerCase())
        }
      }
    }
    return existingTagsCache
  } catch {
    return null
  }
}

export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (tagAliases[lowerTag]) return tagAliases[lowerTag]

  const existingTags = getExistingTags()

  if (existingTags !== null) {
    if (existingTags.has(lowerTag)) return lowerTag
    const singularForm = pluralize.singular(lowerTag)
    if (existingTags.has(singularForm)) return singularForm
    const pluralForm = pluralize.plural(lowerTag)
    if (existingTags.has(pluralForm)) return pluralForm
  } else if (lowerTag.endsWith("s") && lowerTag.length > 3) {
    return pluralize.singular(lowerTag)
  }

  return lowerTag
}

export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}
