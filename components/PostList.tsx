import Link from "next/link"

import Datetime from "components/Datetime"

import { PostType } from "./Post"

export default function PostList({
  posts,
}: {
  posts: Pick<PostType, "id" | "datetime" | "tags" | "title">[]
}): JSX.Element {
  return (
    <section className="mw8 center">
      <ul className="list pl0" key="ul">
        {posts.map((post) => (
          <li className="mb5 ml4 mr3" key={"post-list-" + post.id}>
            <div className="f6 db pb1 gray">
              <span className="dbi mr3">#{post.id}</span>
              <Datetime>{post.datetime}</Datetime>
              <span className="dbi ml3">
                {post.tags.map((tag, i) => (
                  <Link
                    key={i}
                    href={`/tag/${tag}`}
                    className="mh1 link gray dim"
                  >
                    #{tag}
                  </Link>
                ))}
              </span>
            </div>
            <Link
              href={`/post/${post.id}`}
              className="header db f3 f1-ns link dark-gray dim"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
