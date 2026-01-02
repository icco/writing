import { Metadata } from "next"
import { differenceInDays, format, getYear } from "date-fns"

import { Post } from "contentlayer/generated"

import publishedPosts from "@/lib/posts"

export const metadata: Metadata = {
  title: "Stats | Nat? Nat. Nat!",
  description: "Writing statistics for Nat Welch's blog",
}

function StatSlab({
  label,
  value,
  subtitle,
  highlight = false,
}: {
  label: string
  value: string | number
  subtitle?: string
  highlight?: boolean
}) {
  return (
    <dl className="min-w-[140px]">
      <dt className="text-sm font-semibold uppercase tracking-wide opacity-60">
        {label}
      </dt>
      <dd
        className={`text-4xl font-bold tabular-nums md:text-5xl ${highlight ? "text-sky-600 dark:text-sky-400" : ""}`}
      >
        {value}
      </dd>
      {subtitle && <dd className="mt-1 text-sm opacity-50">{subtitle}</dd>}
    </dl>
  )
}

export default function StatsPage() {
  const posts = publishedPosts()

  // Total posts
  const totalPosts = posts.length

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
      <h1 className="my-8 text-center text-4xl font-bold">Stats</h1>

      <article className="mx-auto max-w-4xl px-8 py-7">
        <section className="mb-12">
          <h2 className="mb-6 border-b pb-2 text-lg font-bold uppercase tracking-widest opacity-40">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatSlab
              label="Total Posts"
              value={totalPosts.toLocaleString()}
              highlight
            />
            <StatSlab
              label="Days Since Post"
              value={daysSinceLastPost}
              subtitle={format(lastPostDate, "MMM d, yyyy")}
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
          <h2 className="mb-6 border-b pb-2 text-lg font-bold uppercase tracking-widest opacity-40">
            Posts by Year
          </h2>
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {years.map((year) => (
              <StatSlab
                key={year}
                label={year.toString()}
                value={postsByYear[year]}
              />
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
