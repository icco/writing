import { findAndReplace, Replace } from "mdast-util-find-and-replace"
import { Plugin } from "unified"

/**
 * Plugin to autolink references for hashtags.
 */
export const remarkHashtags: Plugin = () => {
  return (tree) => {
    findAndReplace(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tree as any,
      [[/(^|\s)#([a-z][a-z0-9-]{2,})\b/gi, replaceHashtag]],
      {
        ignore: ["link", "linkReference"],
      }
    )
  }
}

const replaceHashtag: Replace = (
  value: string,
  preText: string,
  tag: string
) => {
  const url = `/tag/${tag}`

  return {
    type: "link",
    title: `#${tag}`,
    url,
    children: [{ type: "text", value }],
  }
}
