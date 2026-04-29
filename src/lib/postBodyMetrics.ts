/** Strip fenced and inline code so metrics ignore examples. */
export function stripCodeFromRaw(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/`[^`\n]+`/g, " ")
}

/** Markdown links [text](url), excluding images ![…](…). */
export function countMarkdownLinks(raw: string): number {
  const body = stripCodeFromRaw(raw)
  const md = body.matchAll(/(?<!\!)\[[^\]]*\]\([^)]+\)/g)
  const angle = body.match(/<https?:\/\/[^>\s]+>/gi)
  return [...md].length + (angle?.length ?? 0)
}

/** Length of raw post body (UTF-16 code units, same as `.length` in JS). */
export function characterCount(raw: string): number {
  return raw.length
}

/**
 * ATX Markdown headings (`#` … `######` then whitespace), excluding
 * lines like `#hashtag` with no space after `#`.
 */
export function countMarkdownHeadings(raw: string): number {
  const body = stripCodeFromRaw(raw)
  const matches = body.match(/^#{1,6}\s+/gm)
  return matches?.length ?? 0
}
