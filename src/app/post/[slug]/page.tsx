import { format, parseISO } from "date-fns"
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

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
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
          width: 800,
          height: 600,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
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

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = getPostBySlug(params.slug)

  const { isEnabled } = draftMode()
  if (!isEnabled && post.draft) {
    notFound()
  }

  const prev = previousPost(post.id)
  const next = nextPost(post.id)

  return (
    <>
      <article className="py-7 px-8 mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="text-xs text-nord3">
            <span className="mx-1 inline-block">
              <Link href={post.url}>#{post.id}</Link>
            </span>
            <span className="mx-1 inline-block">&mdash;</span>
            <time className="mx-1 inline-block" dateTime={post.datetime}>
              {format(parseISO(post.datetime), "LLLL d, yyyy")}
            </time>
          </div>
          <h1>{post.title}</h1>
          <div className="text-xs text-nord3">
            <span className="mx-1 inline-block">
              A {post.readingTime} min read by{" "}
              <Link href="https://natwelch.com">Nat Welch</Link>.
            </span>
          </div>
          {post.draft && <div className="mb-1 text-xs text-nord11">DRAFT</div>}
        </div>
        <MDXContent code={post.body.code} />

        <div className="py-7 px-8 flex mx-auto max-w-5xl">
          <div className="flex-none">
            {prev && (
              <Link href={prev.permalink} title={prev.title}>
                &larr; Previous: #{prev.id}
              </Link>
            )}
          </div>
          <div className="flex-grow"></div>
          <div className="flex-none">
            {next && (
              <Link href={next.permalink} title={next.title}>
                Next: #{next.id} &rarr;
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export default PostLayout
