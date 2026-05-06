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

/**
 * Count entries in the `urls={[…]}` array prop of every `<PhotoGrid …/>`
 * MDX tag in the body. Mirrors the parsing in `src/lib/feed.ts` so feed and
 * stats stay consistent.
 */
function countPhotoGridImages(body: string): number {
  let total = 0
  for (const [tag] of body.matchAll(/<PhotoGrid\b[\s\S]*?\/>/g)) {
    const m = tag.match(/urls\s*=\s*\{\s*\[([\s\S]*?)\]\s*\}/i)
    if (!m) continue
    total += Array.from(m[1].matchAll(/"((?:\\.|[^"\\])*)"/g)).length
  }
  return total
}

/**
 * Body images: markdown `![alt](url)`, literal `<img …>` tags, and entries
 * inside the `urls` array of `<PhotoGrid …/>` MDX components. Code fences and
 * inline code are stripped first.
 */
export function countBodyImages(raw: string): number {
  const body = stripCodeFromRaw(raw)
  const md = body.matchAll(/!\[[^\]]*\]\([^)]+\)/g)
  const html = body.match(/<img\b[^>]*>/gi)
  return (
    [...md].length + (html?.length ?? 0) + countPhotoGridImages(body)
  )
}
