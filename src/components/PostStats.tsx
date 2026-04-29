import type { Post } from "contentlayer/generated"

import {
  characterCount,
  countBodyImages,
  countMarkdownHeadings,
  countMarkdownLinks,
} from "@/lib/postBodyMetrics"

function StatCell({
  title,
  value,
  borderEnd,
}: {
  title: string
  value: string
  borderEnd?: boolean
}) {
  return (
    <div
      className={`stat place-items-center px-2 py-3 lg:place-items-start lg:px-4 ${borderEnd ? "border-base-300 lg:border-e" : ""}`}
    >
      <div className="stat-title">{title}</div>
      <div className="stat-value text-base-content">{value}</div>
    </div>
  )
}

export function PostStats({ post }: { post: Post }) {
  const raw = post.body.raw
  const words = new Intl.NumberFormat("en-US").format(post.wordCount ?? 0)
  const minutes = post.readingTime ?? 0
  const readCeil = Math.ceil(minutes)
  const readValue = minutes < 1 ? "<1 min" : `${readCeil} min`
  const linkCount = countMarkdownLinks(raw)
  const imageCount = countBodyImages(raw)
  const tagCount = post.tags.length
  const chars = characterCount(raw)
  const headings = countMarkdownHeadings(raw)

  type Row = {
    key: string
    title: string
    value: string
  }

  const rows: Row[] = [
    { key: "words", title: "Words", value: words },
    { key: "read", title: "Read time", value: readValue },
    { key: "links", title: "Links", value: String(linkCount) },
    { key: "images", title: "Images", value: String(imageCount) },
    { key: "tags", title: "Tags", value: String(tagCount) },
    {
      key: "chars",
      title: "Characters",
      value: new Intl.NumberFormat("en-US").format(chars),
    },
    { key: "headings", title: "Headings", value: String(headings) },
  ]

  return (
    <aside
      className="not-prose mx-auto my-10 w-full max-w-5xl px-1 sm:px-2"
      aria-label="Post statistics"
    >
      <div className="stats stats-vertical shadow-sm lg:stats-horizontal w-full rounded-box border border-base-300 bg-base-200/40 p-4 sm:p-5">
        {rows.map((row, i) => (
          <StatCell
            key={row.key}
            borderEnd={i < rows.length - 1}
            title={row.title}
            value={row.value}
          />
        ))}
      </div>
    </aside>
  )
}
