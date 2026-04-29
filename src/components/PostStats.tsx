import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import pluralize from "pluralize"

import type { Post } from "contentlayer/generated"

import { normalizeTag } from "@/lib/tagAliases"

function footnoteDefinitionCount(raw: string): number {
  const matches = raw.match(/^\[\^[^\]]+\]:/gm)
  return matches?.length ?? 0
}

export function PostStats({ post }: { post: Post }) {
  const words = new Intl.NumberFormat("en-US").format(post.wordCount ?? 0)
  const minutes = post.readingTime ?? 0
  const readCeil = Math.ceil(minutes)
  const readDisplay = minutes < 1 ? "<1" : String(readCeil)
  const readDesc =
    minutes < 1
      ? "Sub-minute estimate"
      : pluralize("minute", readCeil, true)
  const showUpdated =
    format(parseISO(post.modifiedAt), "yyyy-MM-dd") !==
    format(parseISO(post.datetime), "yyyy-MM-dd")
  const published = parseISO(post.datetime)
  const footnotes = footnoteDefinitionCount(post.body.raw)
  const tagCount = post.tags.length

  return (
    <aside
      className="not-prose mx-auto mt-8 w-full max-w-5xl"
      aria-label="Post statistics"
    >
      <div className="stats stats-vertical shadow-sm lg:stats-horizontal w-full rounded-box border border-base-300 bg-base-200/40">
        <div className="stat place-items-center border-base-300 lg:border-e">
          <div className="stat-figure text-primary">
            <DocumentTextIcon className="h-7 w-7" aria-hidden />
          </div>
          <div className="stat-title">Words</div>
          <div className="stat-value text-primary font-mono text-2xl tabular-nums lg:text-3xl">
            {words}
          </div>
          <div className="stat-desc max-w-[12rem] text-center lg:max-w-none">
            Approximate count
          </div>
        </div>

        <div className="stat place-items-center border-base-300 lg:border-e">
          <div className="stat-figure text-secondary">
            <ClockIcon className="h-7 w-7" aria-hidden />
          </div>
          <div className="stat-title">Reading time</div>
          <div className="stat-value text-secondary font-mono text-2xl tabular-nums lg:text-3xl">
            {readDisplay}
          </div>
          <div className="stat-desc max-w-[12rem] text-center lg:max-w-none">
            {readDesc}
          </div>
        </div>

        <div className="stat place-items-center border-base-300 lg:border-e">
          <div className="stat-figure text-accent">
            <HashtagIcon className="h-7 w-7" aria-hidden />
          </div>
          <div className="stat-title">Post</div>
          <div className="stat-value text-accent font-mono text-2xl tabular-nums lg:text-3xl">
            #{post.id}
          </div>
          <div className="stat-desc max-w-[12rem] text-center lg:max-w-none">
            Series number
          </div>
        </div>

        <div className="stat place-items-center border-base-300 lg:border-e">
          <div className="stat-figure text-base-content/70">
            <CalendarDaysIcon className="h-7 w-7" aria-hidden />
          </div>
          <div className="stat-title">Published</div>
          <div className="stat-value text-xl tabular-nums lg:text-2xl">
            {format(published, "MMM d, yyyy")}
          </div>
          <div className="stat-desc max-w-[14rem] text-center lg:max-w-none">
            {showUpdated ? (
              <>
                Updated{" "}
                <time dateTime={post.modifiedAt}>
                  {format(parseISO(post.modifiedAt), "MMM d, yyyy")}
                </time>
              </>
            ) : (
              "No file edits since publish"
            )}
          </div>
        </div>

        <div className="stat border-base-300 lg:border-e">
          <div className="stat-figure text-base-content/70 self-start pt-1">
            <TagIcon className="h-7 w-7" aria-hidden />
          </div>
          <div className="stat-title">Tags</div>
          <div className="stat-value text-xl tabular-nums lg:text-2xl">
            {tagCount}
          </div>
          <div className="stat-desc w-full max-w-[min(100%,18rem)] px-1 text-left lg:max-w-[14rem]">
            {tagCount === 0 ? (
              <span className="text-base-content/60">No hashtags in body</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 6).map((tag) => {
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
                {tagCount > 6 && (
                  <span className="badge badge-ghost badge-sm">
                    +{tagCount - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {footnotes > 0 && (
          <div className="stat place-items-center">
            <div className="stat-figure text-info">
              <BookOpenIcon className="h-7 w-7" aria-hidden />
            </div>
            <div className="stat-title">Footnotes</div>
            <div className="stat-value text-info font-mono text-2xl tabular-nums lg:text-3xl">
              {footnotes}
            </div>
            <div className="stat-desc max-w-[12rem] text-center lg:max-w-none">
              Definitions in this post
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
