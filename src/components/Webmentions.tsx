import {
  ArrowPathRoundedSquareIcon,
  BookmarkIcon,
  HeartIcon,
} from "@heroicons/react/16/solid"
import { format, parseISO } from "date-fns"
import type { Reaction, ReactionGroups } from "@/lib/webmentions"

const rel = "nofollow ugc"
const piles = [
  {
    kind: "likes",
    Icon: HeartIcon,
    label: ["like", "likes"],
    relation: "u-like-of",
    property: "p-like",
  },
  {
    kind: "reposts",
    Icon: ArrowPathRoundedSquareIcon,
    label: ["repost", "reposts"],
    relation: "u-repost-of",
    property: "p-repost",
  },
  {
    kind: "bookmarks",
    Icon: BookmarkIcon,
    label: ["bookmark", "bookmarks"],
    relation: "u-bookmark-of",
    property: "",
  },
] as const
const threads = {
  replies: { relation: "u-in-reply-to", property: "p-comment" },
  mentions: { relation: "u-mention-of", property: "" },
} as const

function Avatar({ author }: { author: Reaction["author"] }) {
  return author.photo ? (
    // The site-wide Next image loader is for the blog's imgix images, not avatars.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="u-photo ring-base-100 h-6 w-6 rounded-full object-cover ring-2"
      src={author.photo}
      alt={author.name}
      width={24}
      height={24}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span
      aria-hidden="true"
      className="bg-base-300 ring-base-100 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ring-2"
    >
      {author.name.slice(0, 1)}
    </span>
  )
}

export function Webmentions({
  reactions,
  target,
}: {
  reactions: ReactionGroups
  target: string
}) {
  if (!Object.values(reactions).some((group) => group.length)) return null
  const conversation = (["replies", "mentions"] as const)
    .flatMap((kind) => reactions[kind].map((item) => ({ kind, item })))
    .sort(
      (a, b) =>
        (a.item.published || "").localeCompare(b.item.published || "") ||
        a.item.id - b.item.id
    )
  return (
    <section
      aria-label="Responses"
      className="not-prose rounded-box border-base-content/10 bg-base-200/40 mx-auto -mt-12 mb-16 w-full max-w-5xl border px-4 py-3 text-sm shadow-sm sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-base-content/60 font-medium">Responses</span>
        {piles.map(
          ({ kind, Icon, label, relation, property }) =>
            reactions[kind].length > 0 && (
              <div key={kind} className="flex items-center gap-2">
                <span
                  className="text-base-content/70 flex items-center gap-1"
                  title={`${reactions[kind].length} ${label[reactions[kind].length === 1 ? 0 : 1]}`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  <span className="tabular-nums">{reactions[kind].length}</span>
                  <span className="sr-only">
                    {label[reactions[kind].length === 1 ? 0 : 1]}
                  </span>
                </span>
                <div role="list" className="flex -space-x-1.5">
                  {reactions[kind].map((item) => (
                    <div
                      role="listitem"
                      key={item.id}
                      className={`h-cite ${property}`}
                    >
                      <a
                        className="u-url block"
                        href={item.url}
                        rel={rel}
                        title={item.author.name}
                      >
                        <span className="p-author h-card">
                          <Avatar author={item.author} />
                          <span className="p-name sr-only">
                            {item.author.name}
                          </span>
                        </span>
                      </a>
                      <a hidden className={relation} href={target} />
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
      {conversation.length > 0 && (
        <div
          role="list"
          className="divide-base-content/10 border-base-content/10 mt-3 divide-y border-t"
        >
          {conversation.map(({ kind, item }) => (
            <div
              role="listitem"
              key={item.id}
              className={`h-cite ${threads[kind].property} py-3`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="p-author h-card inline-flex items-center gap-2">
                  <Avatar author={item.author} />
                  {item.author.url ? (
                    <a
                      className="p-name u-url link link-hover font-medium"
                      href={item.author.url}
                      rel={rel}
                    >
                      {item.author.name}
                    </a>
                  ) : (
                    <span className="p-name font-medium">
                      {item.author.name}
                    </span>
                  )}
                </span>
                {kind === "replies" ? (
                  <a
                    className="u-url link link-hover text-base-content/60"
                    href={item.url}
                    rel={rel}
                  >
                    {item.published ? (
                      <time className="dt-published" dateTime={item.published}>
                        {format(parseISO(item.published), "MMM d, yyyy")}
                      </time>
                    ) : (
                      "Original reply"
                    )}
                  </a>
                ) : (
                  item.published && (
                    <time
                      className="dt-published text-base-content/60"
                      dateTime={item.published}
                    >
                      {format(parseISO(item.published), "MMM d, yyyy")}
                    </time>
                  )
                )}
              </div>
              {kind === "replies" ? (
                <div className="p-content mt-1 ps-8 break-words whitespace-pre-wrap">
                  {item.text}
                </div>
              ) : (
                <div className="text-base-content/70 mt-1 ps-8 break-words">
                  Mentioned this in{" "}
                  <a className="u-url link" href={item.url} rel={rel}>
                    <span className="p-name">{item.name || item.url}</span>
                  </a>
                </div>
              )}
              <a hidden className={threads[kind].relation} href={target} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
