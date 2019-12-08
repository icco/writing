import Link from "next/link";

import md from "../lib/markdown.js";

export default params => {
  const {
    className,
    data: { comment },
  } = params;

  let html = { __html: md.render(comment.content) };

  return (
    <article className={className}>
      <div className="pv2 ph0-ns pb3-ns">
        <div className="f6 f5-ns mv1">
          <Link
            as={`/comment/${comment.id}`}
            href={`/comment?id=${comment.id}`}
          >
            <a className="link dark-gray dim">{comment.created}</a>
          </Link>{" "}
          - {comment.user.name}
        </div>
        <div className="f6 lh-copy measure mt2 mid-gray">
          <div dangerouslySetInnerHTML={html} />
        </div>
      </div>
    </article>
  );
};
