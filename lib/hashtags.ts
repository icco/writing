import { findAndReplace } from "mdast-util-find-and-replace"
import {
  PhrasingContent,
  ReplaceFunction,
} from "mdast-util-find-and-replace/lib"

/**
 * Plugin to autolink references for hashtags.
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function remarkHashtags() {
  return (tree, vfile) => {
    findAndReplace(tree, /(?:#)([a-z1-9]\d*)/gi, replaceHashtag)

    /**
     * @type {ReplaceFunction}
     * @param {string} value
     * @param {string} no
     * @param {Match} match
     */
    function replaceHashtag(
      value: string,
      no: string,
      match: Match
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