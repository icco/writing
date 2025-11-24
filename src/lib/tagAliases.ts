/**
 * Tag alias mapping: maps alternative tag names to their canonical tag name.
 * This allows tags like "commity" to resolve to "communities".
 * Explicit aliases take precedence over automatic plural handling.
 */
export const tagAliases: Record<string, string> = {
  commity: "communities",
  // Add more aliases here as needed
}

/**
 * Cache of all existing tags from posts.
 * This is used to determine canonical forms for plural/singular handling.
 * Only available at runtime, not during contentlayer build.
 */
let existingTagsCache: Set<string> | null = null

/**
 * Gets all existing tags from posts.
 * Returns null if allPosts is not available (e.g., during build).
 */
function getExistingTags(): Set<string> | null {
  if (existingTagsCache !== null) {
    return existingTagsCache
  }
  
  // Try to access allPosts - this will be undefined during contentlayer build
  // We use a dynamic import check to see if the module is available
  try {
    // During build, contentlayer/generated may not be available
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const contentlayer = require("contentlayer/generated")
    const allPosts = contentlayer.allPosts
    
    if (!allPosts || !Array.isArray(allPosts)) {
      return null
    }
    
    existingTagsCache = new Set<string>()
    for (const post of allPosts) {
      if (post.tags && Array.isArray(post.tags)) {
        for (const tag of post.tags) {
          existingTagsCache.add(tag.toLowerCase())
        }
      }
    }
    return existingTagsCache
  } catch {
    // During build time, allPosts is not available yet
    return null
  }
}

/**
 * Pluralizes a word using common English pluralization rules.
 */
function pluralize(word: string): string {
  const lower = word.toLowerCase()
  
  // Handle common irregular plurals
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
  
  if (irregulars[lower]) {
    return irregulars[lower]
  }
  
  // Words ending in -y (preceded by consonant) -> -ies
  if (/[bcdfghjklmnpqrstvwxz]y$/i.test(word)) {
    return word.slice(0, -1) + "ies"
  }
  
  // Words ending in -s, -ss, -sh, -ch, -x, -z -> add -es
  if (/[sxz]$|sh$|ch$/i.test(word)) {
    return word + "es"
  }
  
  // Words ending in -f or -fe -> -ves
  if (/f$/i.test(word)) {
    return word.slice(0, -1) + "ves"
  }
  if (/fe$/i.test(word)) {
    return word.slice(0, -2) + "ves"
  }
  
  // Default: add -s
  return word + "s"
}

/**
 * Singularizes a word using common English singularization rules.
 */
function singularize(word: string): string {
  const lower = word.toLowerCase()
  
  // Handle common irregular singulars
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
  
  if (irregulars[lower]) {
    return irregulars[lower]
  }
  
  // Words ending in -ies -> -y
  if (/ies$/i.test(word)) {
    return word.slice(0, -3) + "y"
  }
  
  // Words ending in -ves -> -f or -fe
  if (/ves$/i.test(word) && word.length > 3) {
    const base = word.slice(0, -3)
    // Try -f first, then -fe
    if (base.length > 0) {
      return base + "f"
    }
  }
  
  // Words ending in -es (but not -ies, -ves) -> remove -es
  if (/[sxz]es$|shes$|ches$/i.test(word)) {
    return word.slice(0, -2)
  }
  
  // Words ending in -s -> remove -s
  if (/s$/i.test(word) && word.length > 1) {
    return word.slice(0, -1)
  }
  
  // Default: return as-is
  return word
}

/**
 * Normalizes a tag by resolving any aliases to the canonical tag name.
 * Also automatically handles plural/singular forms by checking against existing tags.
 * 
 * Priority:
 * 1. Explicit aliases in tagAliases
 * 2. If existing tags are available:
 *    a. If tag exists in posts, use it as-is
 *    b. Try plural form - if it exists, use that
 *    c. Try singular form - if it exists, use that
 * 3. If existing tags are not available (during build):
 *    a. Use a simple heuristic: prefer plural form for consistency
 * 4. Otherwise, return the tag as-is
 */
export function normalizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase()
  
  // 1. Check explicit aliases first
  if (tagAliases[lowerTag]) {
    return tagAliases[lowerTag]
  }
  
  const existingTags = getExistingTags()
  
  // 2. If we have existing tags (runtime), use them to resolve plurals
  if (existingTags !== null) {
    // 2a. If tag already exists, use it as-is
    if (existingTags.has(lowerTag)) {
      return lowerTag
    }
    
    // 2b. Try plural form
    const pluralForm = pluralize(lowerTag)
    if (existingTags.has(pluralForm)) {
      return pluralForm
    }
    
    // 2c. Try singular form
    const singularForm = singularize(lowerTag)
    if (existingTags.has(singularForm)) {
      return singularForm
    }
  } else {
    // 3. During build time, use a simple heuristic
    // If tag doesn't end in 's', try pluralizing it
    // This helps ensure consistency (e.g., "community" -> "communities")
    if (!lowerTag.endsWith("s") && lowerTag.length > 3) {
      const pluralForm = pluralize(lowerTag)
      // We can't check against existing tags, so we'll use the plural form
      // This will be corrected at runtime when existing tags are available
      return pluralForm
    }
  }
  
  // 4. Return as-is
  return lowerTag
}

/**
 * Gets the canonical tag for a given tag, resolving aliases.
 * This is useful for ensuring all variations of a tag point to the same canonical tag.
 */
export function getCanonicalTag(tag: string): string {
  return normalizeTag(tag)
}

