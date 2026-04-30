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
      className={`stat place-items-start text-left px-4 py-2 sm:px-5 ${borderEnd ? "border-base-300 border-e" : ""}`}
    >
      <div className="stat-title text-left">{title}</div>
      <div className="stat-value text-base-content text-left">{value}</div>
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
      className="not-prose mx-auto my-16 w-full max-w-5xl"
      aria-label="Post statistics"
    >
      <div className="stats stats-horizontal w-full overflow-x-auto rounded-box border border-base-300 bg-base-200/40 py-2 px-4 shadow-sm sm:py-3 sm:px-6">
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
