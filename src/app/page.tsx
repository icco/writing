import { Metadata, Viewport } from "next"

import { PostCard } from "@/components/PostCard"
import publishedPosts from "@/lib/posts"

const title = `Nat? Nat. Nat!`
export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? ""),
  title,
  openGraph: {
    title,
    url: "/",
    siteName: "Nat? Nat. Nat!",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "https://writing.natwelch.com/feed.rss",
      "application/atom+xml": "https://writing.natwelch.com/feed.atom",
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function Home() {
  const posts = publishedPosts()

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
