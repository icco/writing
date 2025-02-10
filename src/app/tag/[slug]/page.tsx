import { notFound } from "next/navigation"

import { PostCard } from "@/components/PostCard"
import { allTags } from "@/components/Tag"
import publishedPosts from "@/lib/posts"

export const generateStaticParams = async () => {
  return allTags().map((tag) => ({ slug: tag }))
}

const TagLayout = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params
  const posts = publishedPosts().filter(
    (post) => post.tags.includes(params.slug) && !post.draft
  )

  if (posts.length === 0) {
    return notFound()
  }

  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">#{params.slug}</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}

export default TagLayout
