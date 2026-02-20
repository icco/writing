import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostCard } from "@/components/PostCard"
import { allTags } from "@/components/Tag"
import publishedPosts from "@/lib/posts"
import { normalizeTag, tagAliases } from "@/lib/tagAliases"

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const params = await props.params
  const tag = normalizeTag(params.slug)
  const title = `Posts tagged #${tag} | Nat? Nat. Nat!`
  const description = `All blog posts tagged #${tag} by Nat Welch`

  return {
    metadataBase: new URL(process.env.DOMAIN ?? ""),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/tag/${tag}`,
      siteName: "Nat? Nat. Nat!",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `/tag/${tag}`,
    },
  }
}

export const generateStaticParams = async () => {
  const canonicalTags = allTags()
  const aliasSlugs = Object.keys(tagAliases)
  
  // Generate params for both canonical tags and their aliases
  return [
    ...canonicalTags.map((tag) => ({ slug: tag })),
    ...aliasSlugs.map((alias) => ({ slug: alias })),
  ]
}

const TagLayout = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params
  const normalizedSlug = normalizeTag(params.slug)
  const posts = publishedPosts().filter(
    (post) => post.tags.includes(normalizedSlug) && !post.draft
  )

  if (posts.length === 0) {
    return notFound()
  }

  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">#{normalizedSlug}</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </>
  )
}

export default TagLayout
