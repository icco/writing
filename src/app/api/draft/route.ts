import { draftMode } from "next/headers"

import { getPostBySlug } from "@/lib/posts"

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  const slug = searchParams.get("slug")

  console.log("Draft mode request:", { secret, slug })

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.SECRET_TOKEN) {
    console.log("Invalid token")
    return new Response("Invalid token", { status: 401 })
  }

  if (!slug) {
    console.log("Missing slug")
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
    const redirectUrl = `/post/${post.id}`

    // Return a Response with a redirect instead of using the redirect() function
    return new Response(null, {
      status: 307,
      headers: {
        Location: redirectUrl,
      },
    })
  } catch (error) {
    console.error("Error in draft mode:", error)
    return new Response("Error processing draft mode request", { status: 500 })
  }
}
