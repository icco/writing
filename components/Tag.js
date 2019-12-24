import Head from "next/head";
import Link from "next/link";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { withRouter } from "next/router";
import { ErrorMessage } from "@icco/react-common";

import Datetime from "./Datetime";

const Tag = props => {
  const {
    id,
    data: { error, postsByTag },
  } = props;

  if (error) return <ErrorMessage message="Tag not found." />;
  if (postsByTag) {
    return (
      <section className="mw8 center">
        <Head>
          <title>Nat? Nat. Nat! | tag "{id}"</title>
        </Head>

        <h1 className="ma4">Posts with tag "{id}"</h1>

        <ul className="list pl0">
          {postsByTag.map(post => (
            <li className="mb5 ml4 mr3" key={post.id}>
              <div className="f6 db pb1 gray">
                <span className="mr3">#{post.id}</span>
                <Datetime>{post.datetime}</Datetime>
              </div>
              <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
                <a className="header db f3 f1-ns link dark-gray dim">
                  {post.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <div />;
};

export const getTag = gql`
  query postsByTag($id: String!) {
    postsByTag(id: $id) {
      id
      title
      datetime
    }
  }
`;

export default graphql(getTag, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(withRouter(Tag));
