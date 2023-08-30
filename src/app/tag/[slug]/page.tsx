import { notFound } from "next/navigation"

import { PostCard } from "@/components/PostCard"

import { allPosts } from "contentlayer/generated"
import publishedPosts from "@/lib/posts"

export const generateStaticParams = async () => {
  const tags = new Set<string>()
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }

  return Array.from(tags)
    .sort()
    .map((tag) => ({ slug: tag }))
}

const TagLayout = ({ params }: { params: { slug: string } }) => {
  const posts = publishedPosts()
    .filter((post) => post.tags.includes(params.slug) && !post.draft)

  if (posts.length === 0) {
    return notFound()
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-center my-8">#{params.slug}</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}

export default TagLayout
