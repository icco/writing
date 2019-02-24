import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import { withRouter } from "next/router";
import md from "../lib/markdown.js";
import Head from "next/head";
import Link from "next/link";
import Datetime from "./Datetime";
import PostNav from "./PostNav";

const Post = props => {
  const {
    data: { error, post },
  } = props;

  if (error) return <ErrorMessage message="Page not found." />;
  if (post) {
    let html = { __html: md.render(post.content) };

    return (
      <section className="mw8 center">
        <Head>
          <title>
            Nat? Nat. Nat! | #{post.id} {post.title}
          </title>
        </Head>

        <div className="mb5 mr3 ml4">
          <div className="f6 db pb1 gray">
            <span className="mr3">#{post.id}</span>
            <Datetime>{post.datetime}</Datetime>
          </div>
          <Link prefetch as={`/post/${post.id}`} href={`/post?id=${post.id}`}>
            <a className="header db f3 f1-ns link dark-gray dim">
              {post.title}
            </a>
          </Link>
        </div>

        <article className="mr3 ml4">
          <div dangerouslySetInnerHTML={html} />
        </article>

        <PostNav post={post} />
      </section>
    );
  }

  return <div />;
};

export const getPost = gql`
  query getPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
      next {
        id
      }
      prev {
        id
      }
    }
  }
`;

export default graphql(getPost, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(withRouter(Post));
