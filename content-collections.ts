import { defineCollection, defineConfig } from "@content-collections/core"
import { createProcessor } from "@mdx-js/mdx"
import { all } from "@wooorm/starry-night"
import { format, parseISO } from "date-fns"
import fs from "node:fs"
import readingTime from "reading-time"
import rehypeGithubEmoji from "rehype-github-emoji"
import rehypeMermaid from "rehype-mermaid"
import rehypeSlug from "rehype-slug"
import rehypeStarryNight from "rehype-starry-night"
import remarkGfm from "remark-gfm"
import { z } from "zod"

import { hashtagRegex, remarkHashtags } from "./src/lib/hashtags"
import {
  remarkStripAnnotations,
  stripAnnotations,
} from "./src/lib/iaWriterAnnotations"
import { migrateImageUrls, remarkImageUrls } from "./src/lib/imageUrls"
import {
  characterCount,
  countBodyImages,
  countMarkdownLinks,
} from "./src/lib/postBodyMetrics"
import { normalizeTag } from "./src/lib/tagAliases"

const mdx = createProcessor({
  outputFormat: "function-body",
  remarkPlugins: [
    remarkStripAnnotations,
    remarkImageUrls,
    remarkHashtags,
    remarkGfm,
  ],
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
  remarkRehypeOptions: { footnoteLabelProperties: { className: [] } },
})

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "**/*.{md,mdx}",
  schema: z.object({
    datetime: z.string(),
    draft: z.boolean().default(false),
    id: z.number(),
    permalink: z.string(),
    title: z.string(),
    summary: z.string().default(""),
    header_image: z.string().optional(),
    header_image_alt_text: z.string().optional(),
    content: z.string(),
  }),
  transform: async ({ content, _meta, ...post }, { cache }) => {
    const datetime = new Date(post.datetime).toISOString()
    const text = stripAnnotations(content)
    const tags = Array.from(
      new Set(
        (text.match(hashtagRegex) ?? []).map((m) =>
          normalizeTag(m.replace(hashtagRegex, "$<tag>"))
        )
      )
    )
    const reading = readingTime(text)
    return {
      ...post,
      datetime,
      _id: _meta.filePath,
      _raw: {
        sourceFilePath: _meta.filePath,
        sourceFileName: _meta.fileName,
        sourceFileDir: _meta.directory,
        flattenedPath: _meta.path,
      },
      type: "Post" as const,
      body: {
        raw: content,
        code: await cache(content, async (source) =>
          String(await mdx.process(source))
        ),
      },
      github: `https://github.com/icco/writing/tree/main/posts/${_meta.fileName}`,
      url: post.draft
        ? `/api/draft?secret=${process.env.SECRET_TOKEN}&slug=${post.id}`
        : post.permalink,
      tags,
      social_image: post.header_image
        ? migrateImageUrls(post.header_image)
        : `/api/og?${new URLSearchParams({
            title: post.title,
            date: format(parseISO(datetime), "LLLL d, yyyy"),
          })}`,
      readingTime: reading.minutes,
      wordCount: reading.words,
      tagCount: tags.length,
      characterCount: characterCount(text),
      linkCount: countMarkdownLinks(text),
      imageCount: countBodyImages(text) + (post.header_image ? 1 : 0),
      modifiedAt: fs.statSync(`posts/${_meta.filePath}`).mtime.toISOString(),
    }
  },
})

export default defineConfig({ content: [posts] })
