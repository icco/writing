import { compareDesc } from "date-fns"
import { Metadata } from "next"

import { PostCard } from "@/components/PostCard"

import { allPosts } from "contentlayer/generated"

const title = `Drafts!`
export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? ""),
  title,
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: { index: false, follow: false },
}

export default function Home() {
  const posts = allPosts
    .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))
    .filter((post) => post.draft)

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
