import { format, parseISO } from "date-fns"
import Link from "next/link"

import { Post } from "contentlayer/generated"

import { Tag } from "./Tag"

export function PostCard(post: Post) {
  return (
    <div className="mb-5">
      <div className="text-muted inline-block pr-2 text-xs">
        <span className="mr-1">#{post.id}</span>
        {post.draft && (
          <>
            <span>&mdash;</span>
            <div className="text-error mx-1 inline-block text-xs">DRAFT</div>
          </>
        )}
      </div>
      <h2 className="hover:text-link mb-1 text-3xl">
        <Link href={post.url}>{post.title}</Link>
      </h2>
      <time
        dateTime={post.datetime}
        className="align-right text-muted mb-2 inline-block text-xs"
      >
        {format(parseISO(post.datetime), "LLLL d, yyyy")}
      </time>

      <div className="dark:text-muted mb-2 text-sm text-gray-600">
        {post.tags.map((tag: string) => {
          return <Tag tag={tag} key={tag} className="text-xs" />
        })}
      </div>
      {post.summary && (
        <div className="text-sm text-muted dark:text-muted">{post.summary}</div>
      )}
    </div>
  )
}
