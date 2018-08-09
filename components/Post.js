import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import { withRouter } from "next/router";
import MarkdownIt from 'markdown-it';
import Moment from "react-moment";
import "moment-timezone";
import Head from "next/head";
import Link from "next/link";

let md = new MarkdownIt({
  // Enable HTML tags in source
  html: true,

  // Use '/' to close single tags (<br />).
  xhtmlOut: true,

  // Convert '\n' in paragraphs into <br>
  breaks: true,

  // Autoconvert URL-like text to links
  linkify: true,
});

const Post = props => {
  const {
    id,
    router: { asPath },
    data: { loading, error, post }
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
            <Moment format="YYYY-MM-DD">{post.datetime}</Moment>
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
      </section>
    );
  }

  return <div />;
};

function notFoundError() {
  const err = new Error(`this will not show up anywhere`);
  err.code = "ENOENT";
  return err;
}

export const getPost = gql`
  query getPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
    }
  }
`;

export default graphql(getPost, {
  options: props => ({
    variables: {
      id: props.id
    }
  })
})(withRouter(Post));
