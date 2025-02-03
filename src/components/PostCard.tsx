import { format, parseISO } from "date-fns"
import Link from "next/link"

import { Post } from "contentlayer/generated"

import { Tag } from "./Tag"

export function PostCard(post: Post) {
  return (
    <div className="mb-5">
      <div className="inline-block pr-2 text-xs text-muted">
        <span className="mr-1">#{post.id}</span>
        {post.draft && (
          <>
            <span>&mdash;</span>
            <div className="inline-block mx-1 text-xs text-error">DRAFT</div>
          </>
        )}
      </div>
      <h2 className="mb-1 text-3xl hover:text-link">
        <Link href={post.url}>{post.title}</Link>
      </h2>
      <time
        dateTime={post.datetime}
        className="inline-block	align-right mb-2 text-xs text-muted"
      >
        {format(parseISO(post.datetime), "LLLL d, yyyy")}
      </time>

      <div className="mb-2 text-sm text-gray-600 dark:text-muted">
        {post.tags.map((tag: string) => {
          return <Tag tag={tag} key={tag} className="text-xs" />
        })}
      </div>
      <div
        className="text-sm *:mb-3 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: post.excerpt.html }}
      />
    </div>
  )
}
