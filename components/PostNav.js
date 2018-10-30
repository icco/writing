import Link from "next/link";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

const PostNav = props => {
  const {
    data: { error, prevPost, nextPost },
  } = props;

  if (error) return <div />;

  let prevText = "";
  if (prevPost && parseInt(prevPost.id) > 0) {
    prevText = (
      <Link prefetch as={`/post/${prevPost.id}`} href={`/post?id=${prevPost.id}`}>
        <a className="link dark-gray dim">&larr; Prev</a>
      </Link>
    );
  }

  let nextText = "";
  if (nextPost && parseInt(nextPost.id) > 0) {
    nextText = (
      <Link prefetch as={`/post/${nextPost.id}`} href={`/post?id=${nextPost.id}`}>
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

export const postNav = gql`
  query navPost($id: ID!) {
    nextPost(id: $id) {
      id
    }

    prevPost(id: $id) {
      id
    }
  }
`;

export default graphql(postNav, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(PostNav);
