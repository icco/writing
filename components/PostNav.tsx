import Link from "next/link";

const PostNav = ({ post }) => {
  let prevText: {};
  if (post.prev && parseInt(post.prev.id) > 0) {
    prevText = (
      <Link href={`/post/${post.prev.id}`}>
        <a className="link dark-gray dim">&larr; Prev</a>
      </Link>
    );
  }

  let nextText: {};
  if (post.next && parseInt(post.next.id) > 0) {
    nextText = (
      <Link href={`/post/${post.next.id}`}>
        <a className="link dark-gray dim">Next &rarr;</a>
      </Link>
    );
  }

  return (
    <section className="mw8 center cf flex">
      <div className="w-33 pa3 tc">{prevText}</div>
      <div className="w-33 pa3 tc">&middot;</div>
      <div className="w-33 pa3 tc">{nextText}</div>
    </section>
  );
};

export default PostNav;
