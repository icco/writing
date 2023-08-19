import { compareDesc } from "date-fns"

import { PostCard } from "@/components/PostCard"

import { allPosts } from "contentlayer/generated"

export const generateMetadata = () => {
  const title = `Nat? Nat. Nat!`

  return {
    metadataBase: new URL(process.env.DOMAIN ?? ""),
    title,
    openGraph: {
      title,
      url: "/",
      siteName: "Nat? Nat. Nat!",
      locale: "en_US",
      type: "website",
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
    alternates: {
      canonical: "/",
      types: {
        'application/rss+xml': 'https://writing.natwelch.com/feed.rss',
        'application/atom+xml': 'https://writing.natwelch.com/feed.atom',
      },
    }
  }
}

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.datetime), new Date(b.datetime))
  )

  return (
    <div className="mx-auto max-w-xl py-8">
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
