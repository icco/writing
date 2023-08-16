import { format, parseISO } from "date-fns"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { getMDXComponent } from "next-contentlayer/hooks"

import { getPostBySlug } from "@/app/util"

import { allPosts } from "contentlayer/generated"

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = getPostBySlug(params.slug)

  return { title: post.title, id: post.id }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = getPostBySlug(params.slug)

  const { isEnabled } = draftMode()
  if (!isEnabled && post.draft) {
    notFound()
  }

  const Content = getMDXComponent(post.body.code)

  return (
    <article className="py-8 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <time dateTime={post.datetime} className="mb-1 text-xs text-gray-600">
          {format(parseISO(post.datetime), "LLLL d, yyyy")}
        </time>
        <h1>{post.title}</h1>
      </div>
      <Content />
    </article>
  )
}

export default PostLayout
