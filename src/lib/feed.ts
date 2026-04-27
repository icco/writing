import { format } from "date-fns"
import { Feed } from "feed"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkHtml from "remark-html"

import { Post } from "contentlayer/generated"

import { getHeaderImageAlt, toAbsoluteImageUrl } from "@/lib/absoluteImageUrl"

async function markdownToHtml(
  markdown: string,
  postUrl: string
): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    // Note: sanitize is disabled because:
    // 1. All content is version-controlled and written by the blog owner
    // 2. Posts contain intentional HTML (links, images, embeds)
    // 3. There is no user-generated content
    .use(remarkHtml, { sanitize: false })
    .process(markdown)
  return result
    .toString()
    .replace(/href="#/g, `href="${postUrl}#`)
}

const FEED_SITE = "https://writing.natwelch.com"

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

/**
 * When a post has a metadata header image, it is not in the MDX body, so feed HTML
 * would not show it. Prepend a figure so RSS/Atom `content:encoded` matches the site.
 * The `image` / enclosure URL remains for clients that use that only.
 */
function withFeedHeaderImageIfPresent(post: Post, contentHtml: string) {
  if (!post.header_image) {
    return contentHtml
  }
  const src = escapeHtmlAttribute(
    toAbsoluteImageUrl(post.social_image, FEED_SITE)
  )
  const alt = escapeHtmlAttribute(getHeaderImageAlt(post))
  return `<p><a href="${FEED_SITE}/post/${post.id}"><img src="${src}" width="800" height="500" alt="${alt}" loading="lazy" /></a></p>\n\n${contentHtml}`
}

function createFeedItem(post: Post, content: string) {
  const contentWithOptionalHero = withFeedHeaderImageIfPresent(post, content)
  return {
    id: `${FEED_SITE}/post/${post.id}`,
    title: post.title,
    link: `${FEED_SITE}/post/${post.id}`,
    date: new Date(post.datetime),
    description: post.summary || undefined,
    category: post.tags.map((t: string) => ({ name: t, term: t })),
    author: [
      {
        name: "Nat Welch",
        email: "nat@natwelch.com",
        link: "https://natwelch.com",
      },
    ],
    content: contentWithOptionalHero,
    image: toAbsoluteImageUrl(post.social_image, FEED_SITE),
  }
}

export default async function generateFeed(posts: Post[]) {
  const feed = new Feed({
    id: "https://writing.natwelch.com/",
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's blog about random stuff.",
    link: "https://writing.natwelch.com/",
    feedLinks: {
      atom: "https://writing.natwelch.com/feed.atom",
      rss: "https://writing.natwelch.com/feed.rss",
    },
    author: {
      name: "Nat Welch",
      email: "nat@natwelch.com",
      link: "https://natwelch.com",
    },
    language: "en",
    copyright: `2011 - ${format(
      new Date(),
      "yyyy"
    )} Nat Welch. All rights reserved.`,
  })

  for (const p of posts) {
    try {
      const postUrl = `https://writing.natwelch.com/post/${p.id}`
      const htmlContent = await markdownToHtml(p.body.raw, postUrl)
      feed.addItem(createFeedItem(p, htmlContent))
    } catch (err) {
      console.error(`Error processing post ${p.id}:`, err)
      // Add post with fallback content on error
      const fallbackContent = `<p>Error rendering post content. Please visit <a href="https://writing.natwelch.com/post/${p.id}">the full post</a> to read it.</p>`
      feed.addItem(createFeedItem(p, fallbackContent))
    }
  }

  return feed
}
