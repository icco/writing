import { NextResponse } from "next/server"

import publishedPosts from "@/lib/posts"

export async function GET() {
  const posts = publishedPosts()

  // Return posts as JSON, excluding the body content to keep response size reasonable
  const postsJson = posts.map((post) => ({
    id: post.id,
    title: post.title,
    datetime: post.datetime,
    permalink: post.permalink,
    url: post.url,
    summary: post.summary,
    autoSummary: post.autoSummary,
    tags: post.tags,
    readingTime: post.readingTime,
    wordCount: post.wordCount,
    social_image: post.social_image,
    github: post.github,
    modifiedAt: post.modifiedAt,
  }))

  return NextResponse.json(postsJson, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

