/**
 * Tag alias mapping: maps alternative tag names to their canonical tag name.
 * This allows tags like "commity" to resolve to "communities".
 */
export const tagAliases: Record<string, string> = {
  commity: "communities",
  // Add more aliases here as needed
}

/**
 * Normalizes a tag by resolving any aliases to the canonical tag name.
 * If the tag has an alias, returns the canonical tag. Otherwise, returns the tag as-is.
 */
export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  return tagAliases[lowerTag] || lowerTag
}

/**
 * Gets the canonical tag for a given tag, resolving aliases.
 * This is useful for ensuring all variations of a tag point to the same canonical tag.
 */
export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}

