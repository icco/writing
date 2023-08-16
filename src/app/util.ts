import { Post, allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";

export function getPostBySlug(slug: string): Post {
  const slugNumber = parseInt(slug)
  const post: Post | undefined = allPosts.find((post) => post.id === slugNumber)
  if (!post) {
    notFound()
  }

  return post
}