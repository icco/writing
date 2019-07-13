import Link from "next/link";

export default (params) => {
  const { className, data: { comment }} = params

  return (
    <article className={className + " dark-gray w5"}>
      <div className="pa2 ph3-ns pb3-ns">
            <strong className="f5 f4-ns mv0">
              <Link
                prefetch
                as={`/comment/${comment.id}`}
                href={`/comment?id=${comment.id}`}
              >
                <a className="link dark-gray dim">perma</a>
              </Link>
            </strong>
        <div
          className="f6 lh-copy measure mt2 mid-gray"
        >
    {comment.content}
    </div>
      </div>
    </article>
  );
};
