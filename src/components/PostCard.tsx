import { format, parseISO } from "date-fns"
import Link from "next/link"

import { Post } from "contentlayer/generated"

export function PostCard(post: Post) {
  return (
    <div className="mb-8">
      <h1 className="mb-1 text-xl">
        <Link
          href={post.url}
        >
          {post.title}
        </Link>
      </h1>
      <div>
        <div
          className="inline-block	pr-2 mb-2 text-xs text-gray-600"
        >#{post.id}</div>
        <time
          dateTime={post.datetime}
          className="inline-block	mb-2 text-xs text-gray-600"
        >
          {format(parseISO(post.datetime), "LLLL d, yyyy")}
        </time>
      </div>

      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {post.tags.map((tag: string) => {
          return (
            <Link
              href={`/tag/${tag}`}
              className="inline-block	pr-1 mb-2 text-xs"
              key={tag}>
              #{tag}
            </Link>
          )
        })}
      </div>
      <div
        className="text-sm [&>*]:mb-3 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: post.excerpt.html }}
      />
    </div>
  )
}
