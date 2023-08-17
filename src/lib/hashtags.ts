import { findAndReplace } from "mdast-util-find-and-replace"

/**
 * Plugin to autolink references for hashtags.
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function remarkHashtags() {
  return (tree: Node): void => {
    findAndReplace(tree, /(?:#)(\w+)/g, replaceHashtag)

    function replaceHashtag(
      value: string,
      match: string[]
    ): PhrasingContent | string | false | undefined | null {
      const url = `/tag/${match}`

      return {
        type: "link",
        title: `#${value}`,
        url,
        children: [{ type: "text", value }],
      }
    }
  }
}
