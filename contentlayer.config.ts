import { defineDocumentType, makeSource } from "contentlayer/source-files"
import { format, parseISO } from "date-fns"
import readingTime from "reading-time"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import { remarkHashtags } from "./src/lib/hashtags"
import { GenerateSocialImage } from "./src/lib/socialimage"

const hashtagRegex = /(?:\s)#(?<tag>\w+)/g

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
    url: { type: "string", resolve: (post) => post.permalink },
    tags: {
      type: "list",
      resolve: (post) => {
        const match = post.body.raw.match(hashtagRegex)
        if (!match) return []
        const tags = new Set<string>(
          match.map((m) => m.replace(hashtagRegex, "$<tag>").toLowerCase())
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
  },
}))

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkHashtags, remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
})
