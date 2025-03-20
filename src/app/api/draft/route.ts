import { draftMode } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { getPostBySlug } from "@/lib/posts"

import { allPosts } from "contentlayer/generated"

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  const slug = searchParams.get("slug")

  console.log(
    "Available posts:",
    allPosts.map((p) => ({ id: p.id, title: p.title }))
  )

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.SECRET_TOKEN) {
    return new Response("Invalid token", { status: 401 })
  }

  if (!slug) {
    return new Response("Missing slug", { status: 400 })
  }

  try {
    const post = getPostBySlug(slug)
    // If the slug doesn't exist prevent draft mode from being enabled
    if (!post) {
      return new Response("Invalid slug", { status: 401 })
    }

    // Enable Draft Mode by setting the cookie
    const dm = await draftMode()
    dm.enable()

    // Redirect to the path from the fetched post
    // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
    redirect(post.permalink)
  } catch (error) {
    console.error("Error fetching post:", error)
    notFound()
  }
}
