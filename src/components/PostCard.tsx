import { format, parseISO } from "date-fns"
import Link from "next/link"

import { Post } from "contentlayer/generated"

import { Tag } from "./Tag"
import { AuthorCard } from "./AuthorCard"
import { canonicalPostUrl } from "@/lib/indieweb"

export function PostCard(post: Post) {
  return (
    <div className="h-entry mb-5">
      <AuthorCard hidden />
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
        <Link
          className="p-name u-url"
          href={post.draft ? post.url : canonicalPostUrl(post.permalink)}
        >
          {post.title}
        </Link>
      </h2>
      <time
        dateTime={post.datetime}
        className="dt-published align-right text-muted mb-2 inline-block text-xs"
      >
        {format(parseISO(post.datetime), "LLLL d, yyyy")}
      </time>

      {post.summary && (
        <div className="p-summary border-primary prose text-muted dark:text-muted my-3 border-l-4 p-2 text-sm">
          {post.summary}
        </div>
      )}

      <div className="dark:text-muted mb-2 text-sm text-gray-600">
        {post.tags.map((tag: string) => {
          return <Tag tag={tag} key={tag} className="p-category text-xs" />
        })}
      </div>
    </div>
  )
}
