import type { Post } from "contentlayer/generated"

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
      className={`stat place-items-start text-left px-4 py-2 sm:px-5 ${borderEnd ? "border-e border-base-content/10" : ""}`}
    >
      <div className="stat-title text-left">{title}</div>
      <div className="stat-value text-base-content text-left">{value}</div>
    </div>
  )
}

export function PostStats({ post }: { post: Post }) {
  const nf = new Intl.NumberFormat("en-US")
  const minutes = post.readingTime
  const readCeil = Math.ceil(minutes)
  const readValue = minutes < 1 ? "<1 min" : `${nf.format(readCeil)} min`

  type Row = {
    key: string
    title: string
    value: string
  }

  const rows: Row[] = [
    { key: "words", title: "Words", value: nf.format(post.wordCount) },
    { key: "read", title: "Read time", value: readValue },
    { key: "links", title: "Links", value: nf.format(post.linkCount) },
    { key: "images", title: "Images", value: nf.format(post.imageCount) },
    { key: "tags", title: "Tags", value: nf.format(post.tagCount) },
    {
      key: "chars",
      title: "Characters",
      value: nf.format(post.characterCount),
    },
    { key: "headings", title: "Headings", value: nf.format(post.headingCount) },
  ]

  return (
    <aside
      className="not-prose mx-auto my-16 w-full max-w-5xl"
      aria-label="Post statistics"
    >
      <div className="stats stats-horizontal w-full overflow-x-auto rounded-box border border-base-content/10 bg-base-200/40 py-2 px-4 shadow-sm sm:py-3 sm:px-6">
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
