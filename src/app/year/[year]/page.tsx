import { getYear } from "date-fns"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostCard } from "@/components/PostCard"
import publishedPosts from "@/lib/posts"

export const generateMetadata = async (props: {
  params: Promise<{ year: string }>
}): Promise<Metadata> => {
  const params = await props.params
  const year = params.year
  const title = `Posts from ${year} | Nat? Nat. Nat!`
  const description = `All blog posts written by Nat Welch in ${year}`

  return {
    metadataBase: new URL(process.env.DOMAIN ?? ""),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/year/${year}`,
      siteName: "Nat? Nat. Nat!",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `/year/${year}`,
    },
  }
}

export const generateStaticParams = async () => {
  const posts = publishedPosts()
  const years = new Set<number>()
  
  posts.forEach((post) => {
    const year = getYear(new Date(post.datetime))
    years.add(year)
  })

  return Array.from(years).map((year) => ({
    year: year.toString(),
  }))
}

const YearLayout = async (props: { params: Promise<{ year: string }> }) => {
  const params = await props.params
  const yearNumber = parseInt(params.year, 10)

  if (isNaN(yearNumber)) {
    return notFound()
  }

  const posts = publishedPosts().filter((post) => {
    const postYear = getYear(new Date(post.datetime))
    return postYear === yearNumber
  })

  if (posts.length === 0) {
    return notFound()
  }

  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">{yearNumber}</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </>
  )
}

export default YearLayout
