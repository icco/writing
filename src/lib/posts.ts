import { compareDesc, isFuture } from "date-fns"

import { allPosts, Post } from "contentlayer/generated"

export default function publishedPosts() {
  const posts = allPosts
    .filter((post) => !post.draft)
    .filter((post) => !isFuture(new Date(post.datetime)))
    .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))

  return posts
}

export function previousPost(slug: number): Post | undefined {
  const posts = publishedPosts()
  const currentIndex = posts.findIndex((post) => post.id === slug)
  const previousPost = posts[currentIndex + 1]
  return previousPost
}

export function nextPost(slug: number): Post | undefined {
  const posts = publishedPosts()
  const currentIndex = posts.findIndex((post) => post.id === slug)
  const nextPost = posts[currentIndex - 1]
  return nextPost
}

export function getPostBySlug(slug: string): Post {
  const slugNumber = parseInt(slug)
  const post: Post | undefined = allPosts.find((post) => post.id === slugNumber)
  if (!post) {
    throw new Error(`Post with slug ${slug} not found`)
  }

  return post
}
