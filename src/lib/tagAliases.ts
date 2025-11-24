import pluralize from "pluralize"

export const tagAliases: Record<string, string> = {
  "chatop": "chatops",
  "chatops": "chatops",
  "dev": "coding",
  "development": "coding",
  "devop": "devops",
  "devops": "sre",
  "k8s": "kubernetes",
  "programming": "coding",
  "starwar": "star-wars",
  "star-war": "star-wars",
  "politics" : "politics",
  "starwars": "star-wars",
  "sysadmin": "sre",
  "sysadmins": "sre",
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
