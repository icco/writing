import Link from "next/link";

import md from "lib/markdown.js";

export default function PostCard({ className, post }) {
  let html = { __html: md.render(post.summary) };

  return (
    <article className={className + " dark-gray w5"}>
      <div className="pa2 ph3-ns pb3-ns">
        <div className="dt w-100 mt1">
          <div className="dtc">
            <h1 className="f5 f4-ns mv0">
              <Link href={`/post/${post.id}`}>
                <a className="link dark-gray dim">{post.title}</a>
              </Link>
            </h1>
          </div>
        </div>
        <div
          className="f6 lh-copy measure mt2 mid-gray"
          dangerouslySetInnerHTML={html}
        />
      </div>
    </article>
  );
}
