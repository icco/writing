import { findAndReplace, Replace } from "mdast-util-find-and-replace"
import { Plugin } from "unified"

export const hashtagRegex = /(^|\s)#(?<tag>[a-z][a-z0-9-]{2,})\b/gi

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
  const stripped = value.trimStart()

  return [
    {
      type: "text",
      value: preText,
    },
    {
      type: "link",
      title: `#${tag}`,
      url,
      children: [{ type: "text", value: stripped }],
    },
  ]
}
