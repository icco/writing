import { notFound } from "next/navigation"

import { allPosts, Post } from "contentlayer/generated"

export function getPostBySlug(slug: string): Post {
  const slugNumber = parseInt(slug)
  const post: Post | undefined = allPosts.find((post) => post.id === slugNumber)
  if (!post) {
    notFound()
  }

  return post
}
