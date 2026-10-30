import { Plugin } from "unified"

const annotationBlock = /(?:^|\r?\n)---[ \t]*\r?\n+Annotations:[ \t]+\d[\s\S]*?\r?\n\.\.\.\s*$/

/** Remove the authorship block iA Writer appends to the end of a Markdown file. */
export function stripAnnotations(raw: string): string {
  return raw.replace(annotationBlock, "\n")
}

/**
 * Wraps the parser because the block is invalid MDX, so a tree transform would
 * run too late to remove it.
 */
export const remarkStripAnnotations: Plugin = function () {
  const parse = this.parser
  if (!parse) throw new Error("remarkStripAnnotations requires a parser")
  this.parser = (doc, file) => parse(stripAnnotations(doc), file)
}
