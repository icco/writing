import { compareDesc } from "date-fns"

import { PostCard } from "@/components/PostCard"

import { allPosts } from "contentlayer/generated"

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.datetime), new Date(b.datetime))
  )

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-8 text-center text-2xl font-black">Nat? Nat. Nat!</h1>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
