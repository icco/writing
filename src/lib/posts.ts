import { compareDesc, isFuture } from "date-fns"

import { allPosts } from "contentlayer/generated"

export default function publishedPosts() {
  const posts = allPosts
    .filter((post) => !post.draft)
    .filter((post) => !isFuture(new Date(post.datetime)))
    .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))

  return posts
}
