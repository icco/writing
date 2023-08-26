import { compareDesc } from "date-fns"

import generateFeed from "@/lib/feed"

import { allPosts } from "contentlayer/generated"

export async function GET() {
  const posts = allPosts
    .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))
    .filter((post) => !post.draft)
  const feed = await generateFeed(posts)
  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml",
    },
  })
}
