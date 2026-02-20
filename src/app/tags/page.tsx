import type { Metadata } from "next"

import { allTagsWithCounts, Tag } from "@/components/Tag"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? ""),
  title: "All Tags | Nat? Nat. Nat!",
  description: "Browse all topics and tags on Nat Welch's blog",
  openGraph: {
    title: "All Tags | Nat? Nat. Nat!",
    description: "Browse all topics and tags on Nat Welch's blog",
    url: "/tags",
    siteName: "Nat? Nat. Nat!",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/tags",
  },
}

const TagList = () => {
  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">Tags</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {allTagsWithCounts().map(({ tag, count }) => (
          <Tag key={tag} tag={tag} count={count} className="p-4 text-xl" />
        ))}
      </div>
    </>
  )
}

export default TagList
