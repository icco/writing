import Link from "next/link"

export default function PostCard({ post }) {
  return (
    <article className="dark-gray w5">
      <div className="pa2 ph3-ns pb3-ns">
        <div className="dt w-100 mt1">
          <div className="dtc">
            <h1 className="f5 f4-ns mv0">
              <Link href={`/post/${post.id}`} className="link dark-gray dim">
                {post.title}
              </Link>
            </h1>
          </div>
        </div>
      </div>
    </article>
  )
}
