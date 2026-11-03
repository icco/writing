import type { Reaction, ReactionGroups } from "@/lib/webmentions"

const relations = { likes: "u-like-of", reposts: "u-repost-of", bookmarks: "u-bookmark-of", replies: "u-in-reply-to", mentions: "u-mention-of" }
const properties = { likes: "p-like", reposts: "p-repost", bookmarks: "", replies: "p-comment", mentions: "" }
const rel = "nofollow ugc"

function Avatar({ author }: { author: Reaction["author"] }) {
  return author.photo ? (
    // The site-wide Next image loader is for the blog's imgix images, not avatars.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="u-photo rounded-full" src={author.photo} alt={author.name} width={32} height={32} loading="lazy" referrerPolicy="no-referrer" />
  ) : <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-base-200">{author.name.slice(0, 1)}</span>
}

export function Webmentions({ reactions, target }: { reactions: ReactionGroups; target: string }) {
  if (!Object.values(reactions).some(group => group.length)) return null
  return (
    <section aria-label="Responses" className="my-6 border-t border-base-300 pt-4">
      <h2 className="mb-4 text-xl">Responses</h2>
      {(["likes", "reposts", "bookmarks"] as const).map(kind => reactions[kind].length > 0 && (
        <div key={kind} className="mb-4">
          <h3 className="mb-2 text-sm">{reactions[kind].length} {kind}</h3>
          <ul className="flex flex-wrap gap-2">
            {reactions[kind].map(item => (
              <li key={item.id} className={`h-cite ${properties[kind]}`}>
                <a className="u-url" href={item.url} rel={rel} title={item.author.name}>
                  <span className="p-author h-card"><Avatar author={item.author} /><span className="p-name sr-only">{item.author.name}</span></span>
                </a>
                <a hidden className={relations[kind]} href={target} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {(["replies", "mentions"] as const).map(kind => reactions[kind].length > 0 && (
        <div key={kind} className="mb-4">
          <h3 className="mb-2 capitalize">{kind}</h3>
          <ul className="space-y-4">
            {reactions[kind].map(item => (
              <li key={item.id} className={`h-cite ${properties[kind]}`}>
                <span className="p-author h-card inline-flex items-center gap-2">
                  <Avatar author={item.author} />
                  {item.author.url ? <a className="p-name u-url" href={item.author.url} rel={rel}>{item.author.name}</a> : <span className="p-name">{item.author.name}</span>}
                </span>{" "}
                <a className="u-url text-sm" href={item.url} rel={rel}>
                  {kind === "mentions" ? <span className="p-name">{item.name || item.url}</span> : "Original reply"}
                </a>
                {item.published && <time className="dt-published ml-2 text-sm text-muted" dateTime={item.published}>{item.published.slice(0, 10)}</time>}
                {kind === "replies" && <p className="p-content whitespace-pre-wrap break-words">{item.text}</p>}
                <a hidden className={relations[kind]} href={target} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
