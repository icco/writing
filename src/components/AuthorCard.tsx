import { BLOG_URL } from "@/lib/indieweb"

export function AuthorCard({
  representative = false,
  hidden = false,
}: {
  representative?: boolean
  hidden?: boolean
}) {
  return (
    <span
      className={representative ? "h-card" : "p-author h-card"}
      hidden={hidden}
    >
      {representative && <a className="u-url u-uid" href={`${BLOG_URL}/`} />}
      <a className="p-name u-url" rel="me" href="https://natwelch.com">
        Nat Welch
      </a>
    </span>
  )
}
