import { format, parseISO } from 'date-fns'
import { Post, allPosts } from 'contentlayer/generated'
import { notFound } from 'next/navigation'

export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: number }}) => {
  const post: Post | undefined = allPosts.find((post) => post.id === params.slug)
  if (!post) {
      notFound()
  }

  return { title: post.title, id: post.id }
}

const PostLayout = ({ params }: { params: { slug: number } }) => {
  const post: Post | undefined = allPosts.find((post) => post.id === params.slug)
  if (!post) {
      notFound()
  }

  return (
    <article className="py-8 mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <time dateTime={post.datetime} className="mb-1 text-xs text-gray-600">
          {format(parseISO(post.datetime), 'LLLL d, yyyy')}
        </time>
        <h1>{post.title}</h1>
      </div>
            <div className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: post.body.html }} />
    </article>
  )
}

export default PostLayout