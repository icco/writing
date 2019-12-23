import Head from "next/head";
import Link from "next/link";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { withRouter } from "next/router";
import { ErrorMessage } from "@icco/react-common";

import Comment from "./Comment";
import CommentEditor from "./CommentEditor";
import Datetime from "./Datetime";
import PostCard from "./PostCard";
import PostNav from "./PostNav";
import md from "../lib/markdown.js";

const Post = props => {
  const {
    data: { error, post },
    comments,
  } = props;

  if (error) {
    return <ErrorMessage message="Unable to get page." />;
  }

  if (post) {
    let html = { __html: md.render(post.content) };
    let draft = "";
    if (post.draft) {
      draft = "DRAFT";
    }

    let commentDiv = <></>;
    if (comments) {
      commentDiv = (
        <article className="mh3 db">
          <h2>Comments</h2>
          <CommentEditor postID={post.id} loggedInUser={props.loggedInUser} />
          <div className="">
            {post.comments.map(item => (
              <Comment key={item.id} data={{ comment: item }} />
            ))}
          </div>
        </article>
      );
    }

    return (
      <section className="mw8 center">
        <Head>
          <title>
            Nat? Nat. Nat! | #{post.id} {post.title}
          </title>
        </Head>

        <div className="mv4 mh3">
          <div className="f6 db pb1 gray">
            <span className="mr3">#{post.id}</span>
            <Datetime>{post.datetime}</Datetime>
            <span className="ml3 red strong">{draft}</span>
          </div>
          <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
            <a className="header db f3 f1-ns link dark-gray dim">
              {post.title}
            </a>
          </Link>
        </div>

        <article className="mh3">
          <div dangerouslySetInnerHTML={html} />
        </article>

        <PostNav post={post} />

        {commentDiv}

        <article className="mh3 dn db-ns">
          <h2>Related Posts</h2>
          <div className="flex items-start justify-between">
            <PostCard className="" post={post.related[0]} />
            <PostCard className="" post={post.related[1]} />
            <PostCard className="" post={post.related[2]} />
            <PostCard className="" post={post.related[3]} />
          </div>
        </article>
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
      draft
      next {
        id
      }
      prev {
        id
      }
      related(input: { limit: 4 }) {
        id
        title
        summary
      }
      comments(input: { limit: 10 }) {
        content
        created
        id
        user {
          name
        }
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
