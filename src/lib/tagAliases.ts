import pluralize from "pluralize"

export const tagAliases: Record<string, string> = {
  "devop": "devops",
  "devops": "sre",
  "sysadmin": "sre",
  "sysadmins": "sre",
  "k8s": "kubernetes",
}

export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (tagAliases[lowerTag]) {
    return tagAliases[lowerTag]
  }

  return pluralize.singular(lowerTag)
}

export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}
