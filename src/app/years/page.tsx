import { getYear } from "date-fns"
import type { Metadata } from "next"
import Link from "next/link"

import publishedPosts from "@/lib/posts"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? ""),
  title: "Archive by Year | Nat? Nat. Nat!",
  description: "Browse Nat Welch's blog posts by year",
  openGraph: {
    title: "Archive by Year | Nat? Nat. Nat!",
    description: "Browse Nat Welch's blog posts by year",
    url: "/years",
    siteName: "Nat? Nat. Nat!",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/years",
  },
}

const YearsList = () => {
  const posts = publishedPosts()
  const yearCounts = new Map<number, number>()

  // Count posts per year
  posts.forEach((post) => {
    const year = getYear(new Date(post.datetime))
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
  })

  // Sort years in descending order
  const years = Array.from(yearCounts.entries())
    .sort((a, b) => b[0] - a[0])

  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">Years</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {years.map(([year, count]) => (
          <Link
            key={year}
            href={`/year/${year}`}
            className="badge badge-secondary mr-2 mb-2 p-4 text-xl"
          >
            {year}
            <span className="ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-primary-content text-xs font-semibold">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default YearsList
