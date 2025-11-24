import pluralize from "pluralize"

export const tagAliases: Record<string, string> = {
}

export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (tagAliases[lowerTag]) return tagAliases[lowerTag]

  // Always singularize for consistent normalization
    return pluralize.singular(lowerTag)
}

export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}
