import { compareDesc } from "date-fns"
import { Metadata, Viewport } from "next"

import { PostCard } from "@/components/PostCard"

import { allPosts, Post } from "contentlayer/generated"

const domain = new URL(process.env.DOMAIN ?? "")
const title = `Drafts!`
export const metadata: Metadata = {
  metadataBase: domain,
  title,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function Drafts() {
  const posts = allPosts
    .sort((a: Post, b: Post) =>
      compareDesc(new Date(a.datetime), new Date(b.datetime))
    )
    .filter((post: Post) => post.draft)

  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">{title}</h1>

      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}
