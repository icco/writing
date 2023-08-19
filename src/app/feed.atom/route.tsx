import generateFeed from "@/lib/feed"

import { allPosts } from "contentlayer/generated"

export async function GET(request: Request) {
  const feed = await generateFeed(allPosts)
  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml",
    },
  })
}
