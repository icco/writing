import { format, parseISO } from "date-fns"
import Link from "next/link"
import pluralize from "pluralize"

import type { Post } from "contentlayer/generated"

import { normalizeTag } from "@/lib/tagAliases"

function footnoteDefinitionCount(raw: string): number {
  const matches = raw.match(/^\[\^[^\]]+\]:/gm)
  return matches?.length ?? 0
}

function MetaSep() {
  return (
    <span className="text-base-content/25 px-1 select-none" aria-hidden>
      ·
    </span>
  )
}

export function PostStats({ post }: { post: Post }) {
  const words = new Intl.NumberFormat("en-US").format(post.wordCount ?? 0)
  const minutes = post.readingTime ?? 0
  const readCeil = Math.ceil(minutes)
  const readPhrase =
    minutes < 1 ? "under 1 min read" : `${readCeil} min read`
  const showUpdated =
    format(parseISO(post.modifiedAt), "yyyy-MM-dd") !==
    format(parseISO(post.datetime), "yyyy-MM-dd")
  const footnotes = footnoteDefinitionCount(post.body.raw)
  const tags = post.tags

  return (
    <aside
      className="not-prose text-base-content/80 mx-auto mt-8 max-w-5xl rounded-box border border-base-300 bg-base-200/30 px-4 py-3 text-sm leading-relaxed"
      aria-label="Post statistics"
    >
      <p className="m-0 font-medium text-base-content">
        {words} words
        <MetaSep />
        {readPhrase}
        {footnotes > 0 && (
          <>
            <MetaSep />
            {footnotes} {pluralize("footnote", footnotes)}
          </>
        )}
      </p>

      {showUpdated && (
        <p className="text-base-content/65 mt-2 mb-0 text-xs">
          File updated{" "}
          <time dateTime={post.modifiedAt}>
            {format(parseISO(post.modifiedAt), "MMMM d, yyyy")}
          </time>
        </p>
      )}

      {tags.length > 0 && (
        <p className="mt-2 mb-0 flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const slug = normalizeTag(tag)
            return (
              <Link
                key={slug}
                href={`/tag/${slug}`}
                className="badge badge-outline badge-sm font-normal"
              >
                #{slug}
              </Link>
            )
          })}
        </p>
      )}
    </aside>
  )
}
