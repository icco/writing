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

export function footnoteDefinitionCount(raw: string): number {
  const matches = raw.match(/^\[\^[^\]]+\]:/gm)
  return matches?.length ?? 0
}
