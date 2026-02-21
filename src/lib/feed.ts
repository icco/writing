import { format } from "date-fns"
import { Feed } from "feed"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkHtml from "remark-html"

import { Post } from "contentlayer/generated"

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    // Note: sanitize is disabled because:
    // 1. All content is version-controlled and written by the blog owner
    // 2. Posts contain intentional HTML (links, images, embeds)
    // 3. There is no user-generated content
    .use(remarkHtml, { sanitize: false })
    .process(markdown)
  return result.toString()
}

function createFeedItem(post: Post, content: string) {
  return {
    id: `https://writing.natwelch.com/post/${post.id}`,
    title: post.title,
    link: `https://writing.natwelch.com/post/${post.id}`,
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
    content,
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
      const htmlContent = await markdownToHtml(p.body.raw)
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
