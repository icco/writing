import { Metadata } from "next"
import { differenceInDays, getYear } from "date-fns"
import Link from "next/link"

import { allPosts, Post } from "contentlayer/generated"

import publishedPosts from "@/lib/posts"

export const metadata: Metadata = {
  title: "Stats | Nat? Nat. Nat!",
  description: "Writing statistics for Nat Welch's blog",
}

function StatSlab({
  label,
  value,
  href,
}: {
  label: string
  value: string | number
  subtitle?: string
  href?: string
}) {
  const content = (
    <dl className="min-w-[140px]">
      <dt className="text-sm font-semibold uppercase tracking-wide opacity-60">
        {label}
      </dt>
      <dd className="text-4xl font-bold tabular-nums md:text-5xl">{value}</dd>
    </dl>
  )

  if (href) {
    return (
      <Link href={href} className="hover:text-link transition-colors">
        {content}
      </Link>
    )
  }

  return content
}

export default function StatsPage() {
  const posts = publishedPosts()

  // Total posts
  const totalPosts = posts.length

  // Drafts
  const draftsCount = allPosts.filter((post) => post.draft).length

  // Days since last post
  const lastPost = posts[0]
  const lastPostDate = new Date(lastPost?.datetime)
  const daysSinceLastPost = differenceInDays(new Date(), lastPostDate)

  // Average word count
  const totalWords = posts.reduce(
    (sum: number, post: Post) => sum + (post.wordCount || 0),
    0
  )
  const avgWordCount = Math.round(totalWords / totalPosts)

  // Posts per year
  const postsByYear: Record<number, number> = {}
  posts.forEach((post: Post) => {
    const year = getYear(new Date(post.datetime))
    postsByYear[year] = (postsByYear[year] || 0) + 1
  })

  const years = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <>
      <h1 className="my-8 text-center">Stats</h1>

      <article className="mx-auto max-w-4xl px-8 py-7">
        <section className="mb-12">
          <h2 className="mb-6 pb-2">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            <StatSlab
              label="Total Posts"
              value={totalPosts.toLocaleString()}
            />
            <StatSlab
              label="Drafts"
              value={draftsCount}
            />
            <StatSlab
              label="Days Since Post"
              value={daysSinceLastPost}
            />
            <StatSlab
              label="Avg. Words/Post"
              value={avgWordCount.toLocaleString()}
            />
            <StatSlab
              label="Total Words"
              value={totalWords.toLocaleString()}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-6 pb-2">
            Posts by Year
          </h2>
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {years.map((year) => (
              <StatSlab
                key={year}
                label={year.toString()}
                value={postsByYear[year]}
                href={`/year/${year}`}
              />
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
