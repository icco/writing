import { allPosts } from "contentlayer/generated"
import { compareDesc } from "date-fns"

export default function publishedPosts() {
  const posts = allPosts
    .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))
    .filter((post) => !post.draft)
    .filter((post) => post.datetime <= new Date().toISOString())

  return posts
}