import Link from "next/link"

import { allPosts } from "contentlayer/generated"

export const allTags = (): string[] => {
  const tags = new Set<string>()
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tags.add(tag)
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b))
}

export const Tag = ({
  tag,
  className,
}: {
  tag: string
  className?: string
}) => {
  return (
    <Link
      href={`/tag/${tag}`}
      className={`badge badge-secondary mr-2 mb-2 ${className}`}
    >
      #{tag}
    </Link>
  )
}
