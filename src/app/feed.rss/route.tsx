import generateFeed from "@/lib/feed"

import { allPosts } from "contentlayer/generated"

export async function GET() {
  const feed = await generateFeed(allPosts)
  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  })
}
