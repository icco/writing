import Link from "next/link"

import { allPosts } from "contentlayer/generated"
import { isFuture } from "date-fns"

import { normalizeTag } from "@/lib/tagAliases"

export const allTags = (): string[] => {
  const tags = new Set<string>()
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b))
}

export const allTagsWithCounts = (): Array<{ tag: string; count: number }> => {
  const tagCounts = new Map<string, number>()

  // Count only published posts (not drafts, not future)
  const publishedPosts = allPosts.filter(
    (post) => !post.draft && !isFuture(new Date(post.datetime))
  )

  for (const post of publishedPosts) {
    for (const tag of post.tags) {
      const normalizedTag = normalizeTag(tag)
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag))
}

export const Tag = ({
  tag,
  count,
  className,
}: {
  tag: string
  count?: number
  className?: string
}) => {
  const normalizedTag = normalizeTag(tag)
  return (
    <Link
      href={`/tag/${normalizedTag}`}
      className={`badge badge-secondary mr-2 mb-2 ${className}`}
    >
      #{normalizedTag}
      {count !== undefined && (
        <span className="ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-primary-content text-xs font-semibold">
          {count}
        </span>
      )}
    </Link>
  )
}
