import Head from "next/head";
import Link from "next/link";
import { ErrorMessage, Loading } from "@icco/react-common";
import { gql, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from 'next/router'

import Comment from "./Comment";
import CommentEditor from "./CommentEditor";
import Datetime from "./Datetime";
import PostCard from "./PostCard";
import PostNav from "./PostNav";
import md from "../lib/markdown.js";

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

export default function Post(params) {
  const router = useRouter()
  const { pid } = router.query

  let { id, comments } = params
  if (pid) {
    id = pid
  }

  const { loading, error, data } = useQuery(getPost, {
    variables: { id },
  });
  const {
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
    user,
  } = useAuth0();

  if (error || authError) {
    return <ErrorMessage message="Unable to get page." />;
  }

  if (loading || authLoading) {
    return <Loading key={0} />;
  }

  const { post } = data;

  if (!post) {
    const e = new Error();
    e.code = "ENOENT";
    e.message = "Post not found";
    throw e;
  }

  let html = { __html: md.render(post.content) };
  let draft = "";
  if (post.draft) {
    draft = "DRAFT";
  }

  let edit = <></>;
  if (isAuthenticated) {
    edit = (
      <Link as={`/edit/${post.id}`} href="/edit/[pid]">
        <a className="mh1 link gray dim">edit</a>
      </Link>
    );
  }

  let commentDiv = <></>;
  if (comments) {
    commentDiv = (
      <article className="mh3 db">
        <h2>Comments</h2>
        <CommentEditor postID={id} loggedInUser={user} />
        <div className="">
          {post.comments.map((item) => (
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
          <span className="ml3">{edit}</span>
          <span className="ml3 red strong">{draft}</span>
        </div>
        <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
          <a className="header db f3 f1-ns link dark-gray dim">{post.title}</a>
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
