import Head from "next/head";
import Link from "next/link";

import Datetime from "./Datetime";
import ErrorMessage from "./ErrorMessage";
import PostNav from "./PostNav";
import md from "../lib/markdown";
import { logger } from "../lib/logger";

const Post = props => {
  const {
    data: { error, post },
  } = props;

  if (error) {
    return <ErrorMessage message="Error retrieving post" />;
  }

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
