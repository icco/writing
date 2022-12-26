import { findAndReplace } from "mdast-util-find-and-replace"
import {
  PhrasingContent,
  ReplaceFunction,
} from "mdast-util-find-and-replace/lib"
import { toString } from "mdast-util-to-string"
import { visit } from "unist-util-visit"

/**
 * Plugin to autolink references for hashtags.
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function remarkHashtags() {
  return (tree, vfile) => {
    findAndReplace(tree, /(?:#)([a-z1-9]\d*)/gi, replaceHashtag)

    visit(tree, "link", (node) => {
      const link = parse(node)

      if (!link) {
        return
      }

      const comment = link.comment ? " (comment)" : ""

      /** @type {StaticPhrasingContent[]} */
      const children = []

      if (base) {
        children.push({ type: "text", value: base + "@" })
      }

      children.push({ type: "inlineCode", value: link.reference })

      if (link.comment) {
        children.push({ type: "text", value: comment })
      }

      node.children = children
    })

    /**
     * @type {ReplaceFunction}
     * @param {string} value
     * @param {string} no
     * @param {Match} match
     */
    function replaceHashtag(
      value,
      no,
      match
    ): PhrasingContent | string | false | undefined | null {
      if (
        /\w/.test(match.input.charAt(match.index - 1)) ||
        /\w/.test(match.input.charAt(match.index + value.length))
      ) {
        return false
      }

      const url = `https://writing.natwelch.com/tag/${tag}`

      return url
        ? {
            type: "link",
            title: null,
            url,
            children: [{ type: "text", value }],
          }
        : false
    }
  }
}

/**
 * Parse a link and determine whether it links to GitHub.
 *
 * @param {import('mdast').Link} node
 * @returns {{user: string, project: string, page: string, reference: string, comment: boolean}|undefined}
 */
function parse(node) {
  const url = node.url || ""
  const match = linkRegex.exec(url)

  if (
    // Not a proper URL.
    !match ||
    // Looks like formatting.
    node.children.length !== 1 ||
    node.children[0].type !== "text" ||
    toString(node) !== url ||
    // SHAs can be min 4, max 40 characters.
    (match[3] === "commit" && (match[4].length < 4 || match[4].length > 40)) ||
    // SHAs can be min 4, max 40 characters.
    (match[3] === "compare" &&
      !/^[a-f\d]{4,40}\.{3}[a-f\d]{4,40}$/.test(match[4])) ||
    // Issues / PRs are decimal only.
    ((match[3] === "issues" || match[3] === "pull") &&
      /[a-f]/i.test(match[4])) ||
    // Projects can be at most 99 characters.
    match[2].length >= 100
  ) {
    return
  }

  let reference = match[4]

  if (match[3] === "compare") {
    const [base, compare] = reference.split("...")
    reference = abbr(base) + "..." + abbr(compare)
  } else {
    reference = abbr(reference)
  }

  return {
    user: match[1],
    project: match[2],
    page: match[3],
    reference,
    comment:
      url.charAt(match[0].length) === "#" && match[0].length + 1 < url.length,
  }
}
