import { PostCard } from "@/components/PostCard"
import { allPosts } from "contentlayer/generated"
import { compareDesc } from "date-fns"
import { notFound } from "next/navigation"

const TagLayout = ({ params }: { params: { slug: string } }) => {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.datetime), new Date(b.datetime))
  ).filter(post => post.tags.includes(params.slug))

  if (posts.length === 0) {
    return notFound()
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-center my-8">
        #{params.slug}
      </h1>
      <div className="mx-auto max-w-xl py-8">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}

export default TagLayout
