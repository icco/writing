import { Metadata } from "next"
import { differenceInDays, getYear } from "date-fns"

import publishedPosts from "@/lib/posts"

export const metadata: Metadata = {
  title: "Stats | Nat? Nat. Nat!",
  description: "Writing statistics for Nat Welch's blog",
}

function StatSlab({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <dl className="mr-8 mb-6 inline-block align-top">
      <dt className="text-sm font-bold uppercase tracking-wide opacity-70">
        {label}
      </dt>
      <dd className="text-4xl font-bold tabular-nums md:text-5xl">{value}</dd>
    </dl>
  )
}

export default function StatsPage() {
  const posts = publishedPosts()

  // Total posts
  const totalPosts = posts.length

  // Days since last post
  const lastPostDate = new Date(posts[0]?.datetime)
  const daysSinceLastPost = differenceInDays(new Date(), lastPostDate)

  // Average word count
  const totalWords = posts.reduce((sum, post) => sum + (post.wordCount || 0), 0)
  const avgWordCount = Math.round(totalWords / totalPosts)

  // Posts per year
  const postsByYear: Record<number, number> = {}
  posts.forEach((post) => {
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
          <h2 className="mb-6 text-2xl font-bold">Overview</h2>
          <div>
            <StatSlab label="Total Posts" value={totalPosts.toLocaleString()} />
            <StatSlab label="Days Since Last Post" value={daysSinceLastPost} />
            <StatSlab label="Avg. Words/Post" value={avgWordCount.toLocaleString()} />
            <StatSlab label="Total Words" value={totalWords.toLocaleString()} />
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">Posts by Year</h2>
          <div>
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

