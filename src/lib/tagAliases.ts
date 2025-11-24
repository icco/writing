import pluralize from "pluralize"

export const tagAliases: Record<string, string> = {
  "dev": "coding",
  "development": "coding",
  "devops": "sre",
  "k8s": "kubernetes",
  "programming": "coding",
  "sysadmin": "sre",
  "sysadmins": "sre",
}

// Tags that should remain plural and not be singularized
export const approvedPlurals: Set<string> = new Set([
  "starwars",
  "politics",
  "chatops",
])

export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (tagAliases[lowerTag]) {
    return tagAliases[lowerTag]
  }

  // If the tag is in the approved plurals list, return it as-is
  if (approvedPlurals.has(lowerTag)) {
    return lowerTag
  }

  return pluralize.singular(lowerTag)
}

export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}
