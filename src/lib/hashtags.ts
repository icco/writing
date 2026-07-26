import { findAndReplace, Replace } from "mdast-util-find-and-replace"
import { Plugin } from "unified"

import { normalizeTag } from "./tagAliases"

export const hashtagRegex = /(^|\s)\\?#(?<tag>[a-zA-Z][a-zA-Z0-9-]{1,})\b/gim

/**
 * Plugin to autolink references for hashtags.
 */
export const remarkHashtags: Plugin = () => {
  return (tree) => {
    findAndReplace(
       
      tree as any,
      [[hashtagRegex, replaceHashtag]],
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
  const normalizedTag = normalizeTag(tag)
  const url = `/tag/${normalizedTag}`
  const stripped = value.trimStart().replace(/^\\/, "")

  return [
    {
      type: "text",
      value: preText,
    },
    {
      type: "link",
      title: `#${normalizedTag}`,
      url,
      children: [{ type: "text", value: stripped }],
    },
  ]
}
