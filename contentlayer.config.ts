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
        const params = new URLSearchParams({
          title: post.title,
          date: format(parseISO(post.datetime), "LLLL d, yyyy"),
        })
        return `/api/og?${params.toString()}`
      },
    },
    autoSummary: {
      type: "string",
      resolve: (post) => {
        // If summary is provided in frontmatter, use that
        if (post.summary && post.summary.trim().length > 0) {
          return post.summary.trim()
        }
        
        // Otherwise, generate a summary from the first paragraph
        const text = post.body.raw
          .replace(/^---[\s\S]*?---/, "") // Remove frontmatter
          .replace(/#[^\s#]+/g, "") // Remove hashtags
          .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
          .replace(/[#*_`]/g, "") // Remove markdown formatting
          .trim()
        
        // Get first meaningful paragraph
        const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0)
        const firstParagraph = paragraphs[0] || ""
        
        // Truncate to reasonable length for OG description
        const maxLength = 160
        if (firstParagraph.length <= maxLength) {
          return firstParagraph
        }
        
        // Truncate at last complete word
        const truncated = firstParagraph.substring(0, maxLength)
        const lastSpace = truncated.lastIndexOf(" ")
        return lastSpace > 0
          ? truncated.substring(0, lastSpace) + "..."
          : truncated + "..."
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
  },
})
