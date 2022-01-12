import { md } from "lib/markdown"
import Link from "next/link"

export default function Comment(params) {
  const {
    className,
    data: { comment },
  } = params

  const html = { __html: md.render(comment.content) }

  return (
    <article className={className}>
      <div className="pv2 ph0-ns pb3-ns">
        <div className="f6 f5-ns mv1">
          <Link href={`/comments/${comment.id}`}>
            <a className="link dark-gray dim">{comment.created}</a>
          </Link>{" "}
          - {comment.user.name}
        </div>
        <div className="f6 lh-copy measure mt2 mid-gray">
          <div dangerouslySetInnerHTML={html} />
        </div>
      </div>
    </article>
  )
}
