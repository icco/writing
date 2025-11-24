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

function pluralize(word: string): string {
  const lower = word.toLowerCase()
  const irregulars: Record<string, string> = {
    child: "children",
    person: "people",
    man: "men",
    woman: "women",
    mouse: "mice",
    foot: "feet",
    tooth: "teeth",
    goose: "geese",
    ox: "oxen",
    die: "dice",
  }

  if (irregulars[lower]) return irregulars[lower]
  if (/[bcdfghjklmnpqrstvwxz]y$/i.test(word)) return word.slice(0, -1) + "ies"
  if (/[sxz]$|sh$|ch$/i.test(word)) return word + "es"
  if (/f$/i.test(word)) return word.slice(0, -1) + "ves"
  if (/fe$/i.test(word)) return word.slice(0, -2) + "ves"
  return word + "s"
}

function singularize(word: string): string {
  const lower = word.toLowerCase()
  const irregulars: Record<string, string> = {
    children: "child",
    people: "person",
    men: "man",
    women: "woman",
    mice: "mouse",
    feet: "foot",
    teeth: "tooth",
    geese: "goose",
    oxen: "ox",
    dice: "die",
  }

  if (irregulars[lower]) return irregulars[lower]
  if (/ies$/i.test(word)) return word.slice(0, -3) + "y"
  if (/ves$/i.test(word) && word.length > 3) return word.slice(0, -3) + "f"
  if (/[sxz]es$|shes$|ches$/i.test(word)) return word.slice(0, -2)
  if (/s$/i.test(word) && word.length > 1) return word.slice(0, -1)
  return word
}

export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  if (tagAliases[lowerTag]) return tagAliases[lowerTag]

  const existingTags = getExistingTags()

  if (existingTags !== null) {
    if (existingTags.has(lowerTag)) return lowerTag
    const singularForm = singularize(lowerTag)
    if (existingTags.has(singularForm)) return singularForm
    const pluralForm = pluralize(lowerTag)
    if (existingTags.has(pluralForm)) return pluralForm
  } else if (lowerTag.endsWith("s") && lowerTag.length > 3) {
    return singularize(lowerTag)
  }

  return lowerTag
}

export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}
