import { all } from "@wooorm/starry-night"
import { defineDocumentType, makeSource } from "contentlayer2/source-files"
import { format, parseISO } from "date-fns"
import fs from "fs"
import readingTime from "reading-time"
import rehypeGithubEmoji from "rehype-github-emoji"
import rehypeMermaid from "rehype-mermaid"
import rehypeSlug from "rehype-slug"
import rehypeStarryNight from "rehype-starry-night"
import remarkGfm from "remark-gfm"

import { hashtagRegex, remarkHashtags } from "./src/lib/hashtags"
import {
  characterCount as countSourceCharacters,
  countBodyImages,
  countMarkdownLinks,
} from "./src/lib/postBodyMetrics"

import { normalizeTag } from "./src/lib/tagAliases"

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.md(x)?`,
  contentType: "mdx",
  fields: {
    datetime: { type: "date", required: true },
    draft: { type: "boolean", required: false, default: false },
    id: { type: "number", required: true },
    permalink: { type: "string", required: true },
    title: { type: "string", required: true },
    summary: { type: "string", required: false, default: "" },
    header_image: { type: "string", required: false },
    header_image_alt_text: { type: "string", required: false },
  },
  computedFields: {
    github: {
      type: "string",
      resolve: (post) => {
        return `https://github.com/icco/writing/tree/main/posts/${post._raw.sourceFileName}`
      },
    },
    url: {
      type: "string",
      resolve: (post) => {
        if (post.draft) {
          return `/api/draft?secret=${process.env.SECRET_TOKEN}&slug=${post.id}`
        }
        return post.permalink
      },
    },
    tags: {
      type: "list",
      resolve: (post) => {
        const match = post.body.raw.match(hashtagRegex)
        if (!match) return []
        const tags = new Set<string>(
          match.map((m: string) =>
            normalizeTag(m.replace(hashtagRegex, "$<tag>"))
          )
        )

        return Array.from(tags)
      },
    },
    social_image: {
      type: "string",
      resolve: (post) => {
        if (post.header_image) {
          return post.header_image
        }
        const params = new URLSearchParams({
          title: post.title,
          date: format(parseISO(post.datetime), "LLLL d, yyyy"),
        })
        return `/api/og?${params.toString()}`
      },
    },
    readingTime: {
      type: "number",
      resolve: (post) => readingTime(post.body.raw).minutes,
    },
    wordCount: {
      type: "number",
      resolve: (post) => readingTime(post.body.raw).words,
    },
    /** Distinct hashtags (same logic as `tags`, for stats without recomputing in React). */
    tagCount: {
      type: "number",
      resolve: (post) => {
        const match = post.body.raw.match(hashtagRegex)
        if (!match) return 0
        return new Set(
          match.map((m: string) =>
            normalizeTag(m.replace(hashtagRegex, "$<tag>"))
          )
        ).size
      },
    },
    characterCount: {
      type: "number",
      resolve: (post) => countSourceCharacters(post.body.raw),
    },
    linkCount: {
      type: "number",
      resolve: (post) => countMarkdownLinks(post.body.raw),
    },
    imageCount: {
      type: "number",
      resolve: (post) =>
        countBodyImages(post.body.raw) + (post.header_image ? 1 : 0),
    },
    modifiedAt: {
      type: "string",
      resolve: (doc) => {
        return new Date(
          fs.statSync("posts/" + doc._raw.sourceFilePath).mtime
        ).toISOString()
      },
    },
  },
}))

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkHashtags, remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeGithubEmoji,
      [rehypeStarryNight, { grammars: all }],
      [
        rehypeMermaid,
        { strategy: "img-svg", dark: true, mermaidConfig: { layout: "elk" } },
      ],
    ],
    // GFM footnotes label defaults to h2.sr-only; show it to sighted readers.
    // See remark-rehype / mdast-util-to-hast `footnoteLabelProperties`.
    mdxOptions: (opts) => ({
      ...opts,
      remarkRehypeOptions: {
        ...opts.remarkRehypeOptions,
        footnoteLabelProperties: { className: [] },
      },
    }),
  },
})
