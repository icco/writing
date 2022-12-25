import Link from "next/link"

const PostNav = ({ post }) => {
  let prevText: JSX.Element
  if (post.prev && parseInt(post.prev.id) > 0) {
    prevText = (
      <Link href={`/post/${post.prev.id}`} className="link dark-gray dim">
        &larr; Prev
      </Link>
    )
  }

  let nextText: JSX.Element
  if (post.next && parseInt(post.next.id) > 0) {
    nextText = (
      <Link href={`/post/${post.next.id}`} className="link dark-gray dim">
        Next &rarr;
      </Link>
    )
  }

  return (
    <section className="mw8 center cf flex">
      <div className="w-33 pa3 tc">{prevText}</div>
      <div className="w-33 pa3 tc">&middot;</div>
      <div className="w-33 pa3 tc">{nextText}</div>
    </section>
  )
}

export default PostNav
