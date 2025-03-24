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
import { GenerateSocialImage } from "./src/lib/socialimage"

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
    excerpt: { type: "markdown", required: false, default: "" },
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
            m.replace(hashtagRegex, "$<tag>").toLowerCase()
          )
        )

        return Array.from(tags)
      },
    },
    social_image: {
      type: "string",
      resolve: (post) =>
        GenerateSocialImage(
          post.title,
          format(parseISO(post.datetime), "LLLL d, yyyy")
        ),
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
      [rehypeMermaid, { strategy: "img-svg", dark: true }],
    ],
  },
})
