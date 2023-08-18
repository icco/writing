import { format, parseISO } from "date-fns"
import Link from "next/link"

import { Post } from "contentlayer/generated"

export function PostCard(post: Post) {
  return (
    <div className="mb-5">
      <div
        className="inline-block pr-2 text-xs text-muted"
      >
        #{post.id}
      </div>
      <h1 className="mb-1 text-4xl hover:text-link">
        <Link
          href={post.url}
        >
          {post.title}
        </Link>
      </h1>
      <time
        dateTime={post.datetime}
        className="inline-block	align-right mb-2 text-xs text-muted"
      >
        {format(parseISO(post.datetime), "LLLL d, yyyy")}
      </time>

      <div className="mb-2 text-sm text-gray-600 dark:text-muted">
        {post.tags.map((tag: string) => {
          return (
            <Link
              href={`/tag/${tag}`}
              className="inline-block	pr-1 mb-2 text-xs hover:text-link"
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
