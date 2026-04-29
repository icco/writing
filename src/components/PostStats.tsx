import { format, parseISO } from "date-fns"

import type { Post } from "contentlayer/generated"

export function PostStats({ post }: { post: Post }) {
  const words = new Intl.NumberFormat("en-US").format(post.wordCount ?? 0)
  const minutes = post.readingTime ?? 0
  const readLabel =
    minutes < 1 ? "Under 1 min read" : `${Math.ceil(minutes)} min read`
  const showUpdated =
    format(parseISO(post.modifiedAt), "yyyy-MM-dd") !==
    format(parseISO(post.datetime), "yyyy-MM-dd")

  return (
    <aside
      className="not-prose text-muted mx-auto mt-6 max-w-5xl border-t border-base-300 pt-4 text-sm"
      aria-label="Post statistics"
    >
      <dl className="m-0 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div className="flex gap-1">
          <dt className="sr-only">Word count</dt>
          <dd className="m-0">{words} words</dd>
        </div>
        <div className="flex gap-1">
          <dt className="sr-only">Reading time</dt>
          <dd className="m-0">{readLabel}</dd>
        </div>
        {showUpdated && (
          <div className="flex gap-1">
            <dt className="sr-only">Last updated</dt>
            <dd className="m-0">
              Updated{" "}
              <time dateTime={post.modifiedAt}>
                {format(parseISO(post.modifiedAt), "LLLL d, yyyy")}
              </time>
            </dd>
          </div>
        )}
      </dl>
    </aside>
  )
}
