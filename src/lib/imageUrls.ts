/** Normalize historical post URLs at publication time, including RSS and links. */
export function migrateImageUrls(value: string): string {
  return value.replaceAll("https://icco.imgix.net/", "https://images.natwelch.com/")
}

/** Runs before MDX compilation so Markdown, raw HTML and PhotoGrid props agree. */
export function remarkImageUrls() {
  return (tree: unknown) => {
    const visit = (node: unknown) => {
      if (!node || typeof node !== "object") return
      for (const [key, value] of Object.entries(node)) {
        if (typeof value === "string") {
          ;(node as Record<string, unknown>)[key] = migrateImageUrls(value)
        } else if (Array.isArray(value)) {
          value.forEach(visit)
        } else if (value && typeof value === "object") {
          visit(value)
        }
      }
    }
    visit(tree)
  }
}
