import Link from "next/link";

import Datetime from "./Datetime";

export default function PostResult({ post }) {
  return (
            <li className="mb5 ml4 mr3" key={"post-list-" + post.id}>
              <div className="f6 db pb1 gray">
                <span className="dbi mr3">#{post.id}</span>
                <Datetime>{post.datetime}</Datetime>
                <span className="dbi ml3">
                  {post.tags.map((tag, i) => (
                    <Link key={i} as={`/tag/${tag}`} href={`/tag/[id]`}>
                      <a className="mh1 link gray dim">#{tag}</a>
                    </Link>
                  ))}
                </span>
              </div>
              <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
                <a className="header db f3 f1-ns link dark-gray dim">
                  {post.title}
                </a>
              </Link>
            </li>
  )
}
