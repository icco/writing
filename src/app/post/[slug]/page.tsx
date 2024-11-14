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
  publishedPosts().map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const post = getPostBySlug(params.slug)

  const title = `Nat? Nat. Nat! | #${post.id} ${post.title}`

  return {
    metadataBase: new URL(process.env.DOMAIN ?? ""),
    title,
    id: post.id,
    openGraph: {
      title,
      url: post.url,
      siteName: "Nat? Nat. Nat!",
      images: [
        {
          url: post.social_image,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "article",
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
  const params = await props.params;
  const post = getPostBySlug(params.slug)

  const { isEnabled } = await draftMode()
  if (!isEnabled && post.draft) {
    notFound()
  }

  const prev = previousPost(post.id)
  const next = nextPost(post.id)

  return (
    <>
      <article className="py-7 px-8 mx-auto max-w-5xl">
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
          {post.draft && <div className="mb-1 text-xs text-error">DRAFT</div>}
        </div>

        <div className="prose lg:prose-xl max-w-5xl">
          <MDXContent code={post.body.code} />
        </div>

        <div className="py-7 px-8 flex mx-auto max-w-5xl align-middle">
          <div className="flex-none">
            {prev && (
              <Link
                href={prev.permalink}
                title={prev.title}
                className="btn btn-secondary"
              >
                <ChevronLeftIcon className="inline-block w-6 h-6" /> #{prev.id}
              </Link>
            )}
          </div>
          <div className="flex-grow flex">
            <div className="flex-grow"></div>
            <div className="flex-none">
              <Link
                href={post.github}
                title="Edit this post on Github"
                className="btn btn-ghost"
              >
                <PencilIcon className="inline-block w-4 h-4" />
              </Link>
            </div>
            <div className="flex-grow"></div>
          </div>
          <div className="flex-none">
            {next && (
              <Link
                href={next.permalink}
                title={next.title}
                className="btn btn-secondary"
              >
                #{next.id} <ChevronRightIcon className="inline-block w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export default PostLayout
