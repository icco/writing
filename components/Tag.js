import Head from "next/head";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { useQuery } from "@apollo/react-hooks";

import PostResult from "./PostResult";

export const getTag = gql`
  query postsByTag($id: String!) {
    postsByTag(id: $id) {
      id
      title
      datetime
    }
  }
`;

export default function Tag({ id }) {
  const { loading, error, data } = useQuery(getTag, {
    variables: { id },
  });

  if (error) {
    return <ErrorMessage message="Tag not found." />;
  }
  if (loading) {
    return <Loading key={0} />;
  }

  const { postsByTag } = data;

  return (
    <section className="mw8 center">
      <Head>
        <title>Nat? Nat. Nat! | tag "{id}"</title>
      </Head>

      <h1 className="ma4">Posts with tag "{id}"</h1>

      <ul className="list pl0">
        {postsByTag.map(post => (
          <PostResult post={post} key={post.id} />
        ))}
      </ul>
    </section>
  );
}
