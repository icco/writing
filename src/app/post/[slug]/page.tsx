import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from "@heroicons/react/24/outline"
import { format, parseISO } from "date-fns"
import type { Viewport } from "next"
import { draftMode } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"

import { MDXContent } from "@/components/MDXContent"
import publishedPosts, {
  getPostBySlug,
  nextPost,
  previousPost,
} from "@/lib/posts"

export const generateStaticParams = async () =>
  publishedPosts()
    .sort((a, b) => b.datetime.localeCompare(a.datetime))
    .map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>
}) => {
  const params = await props.params
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const title = `#${post.id} ${post.title}`
  const description = post.summary || undefined

  return {
    metadataBase: new URL(process.env.DOMAIN ?? ""),
    title,
    description,
    id: post.id,
    openGraph: {
      title,
      description,
      url: post.url,
      siteName: "Nat? Nat. Nat!",
      images: [
        {
          url: post.social_image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.datetime,
      modifiedTime: post.modifiedAt,
      authors: ["Nat Welch"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: post.social_image, alt: post.title }],
    },
    alternates: {
      canonical: post.url,
      types: {
        "application/rss+xml": "https://writing.natwelch.com/feed.rss",
        "application/atom+xml": "https://writing.natwelch.com/feed.atom",
      },
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

const PostLayout = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const { isEnabled } = await draftMode()
  if (!isEnabled && post.draft) {
    notFound()
  }

  const prev = previousPost(post.id)
  const next = nextPost(post.id)

  const domain = process.env.DOMAIN || "https://writing.natwelch.com"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.datetime,
    dateModified: post.modifiedAt,
    author: {
      "@type": "Person",
      name: "Nat Welch",
      url: "https://natwelch.com",
    },
    url: `${domain}${post.permalink}`,
    image: `${domain}${post.social_image}`,
    ...(post.summary ? { description: post.summary } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${domain}${post.permalink}`,
    },
    publisher: {
      "@type": "Person",
      name: "Nat Welch",
      url: "https://natwelch.com",
    },
    keywords: post.tags,
    wordCount: post.wordCount,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-5xl px-8 py-7">
        <div className="mb-8 text-center">
          <div className="text-xs">
            <span className="mx-1 inline-block">
              <Link href={post.url}>#{post.id}</Link>
            </span>
            <span className="mx-1 inline-block">&mdash;</span>
            <time className="mx-1 inline-block" dateTime={post.datetime}>
              {format(parseISO(post.datetime), "LLLL d, yyyy")}
            </time>
          </div>
          <h1>{post.title}</h1>
          <div className="text-xs">
            <span className="mx-1 inline-block">
              By <Link href="https://natwelch.com">Nat Welch</Link>
            </span>
          </div>
          {post.draft && <div className="text-error mb-1 text-xs">DRAFT</div>}
        </div>

        <div className="prose lg:prose-xl max-w-5xl">
          <MDXContent code={post.body.code} />
        </div>

        <div className="mx-auto flex max-w-5xl px-8 py-7 align-middle">
          <div className="flex-none">
            {prev && (
              <Link
                href={prev.permalink}
                title={prev.title}
                className="btn btn-secondary"
              >
                <ChevronLeftIcon className="inline-block h-6 w-6" /> #{prev.id}
              </Link>
            )}
          </div>
          <div className="flex grow">
            <div className="grow"></div>
            <div className="flex-none">
              <Link
                href={post.github}
                title="Edit this post on Github"
                className="btn btn-ghost"
              >
                <PencilIcon className="inline-block h-4 w-4" />
              </Link>
            </div>
            <div className="grow"></div>
          </div>
          <div className="flex-none">
            {next && (
              <Link
                href={next.permalink}
                title={next.title}
                className="btn btn-secondary"
              >
                #{next.id} <ChevronRightIcon className="inline-block h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export default PostLayout
