import { format, parseISO } from "date-fns"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"

import { MDXContent } from "@/components/MDXContent"
import { getPostBySlug } from "@/lib/util"

import { allPosts } from "contentlayer/generated"

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

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
    canonical: post.url,
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
  }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = getPostBySlug(params.slug)

  const { isEnabled } = draftMode()
  if (!isEnabled && post.draft) {
    notFound()
  }

  return (
    <article className="py-8 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <time dateTime={post.datetime} className="mb-1 text-xs text-gray-600">
          {format(parseISO(post.datetime), "LLLL d, yyyy")}
        </time>
        <h1>{post.title}</h1>
      </div>
      <MDXContent code={post.body.code} />
    </article>
  )
}

export default PostLayout
