import { compareDesc } from "date-fns"
import { Metadata, Viewport } from "next"
import { headers } from "next/headers"

import { PostCard } from "@/components/PostCard"

import { allPosts, Post } from "contentlayer/generated"

const title = `Drafts!`
export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? ""),
  title,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function Drafts() {
  const headersList = headers()
  const host = headersList.get("host")

  if (!host?.includes("localhost")) {
    throw new Error("This page is restricted to development")
  }

  const posts = allPosts
    .sort((a: Post, b: Post) =>
      compareDesc(new Date(a.datetime), new Date(b.datetime))
    )
    .filter((post: Post) => post.draft)

  return (
    <>
      <h1 className="text-4xl font-bold text-center my-8">{title}</h1>

      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}
