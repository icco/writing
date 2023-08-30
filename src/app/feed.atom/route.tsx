import generateFeed from "@/lib/feed"
import publishedPosts from "@/lib/posts"

export async function GET() {
  const posts = publishedPosts()
  const feed = await generateFeed(posts)
  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml",
    },
  })
}
