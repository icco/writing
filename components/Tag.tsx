import { gql, useQuery } from "@apollo/client";
import { ErrorMessage, Loading } from "@icco/react-common";
import Datetime from "components/Datetime";
import Head from "next/head";
import Link from "next/link";

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
    return <ErrorMessage error={error} message="Tag not found." />;
  }
  if (loading) {
    return <Loading key={0} />;
  }

  const { postsByTag } = data;

  return (
    <section className="mw8 center">
      <Head>
        <title>Nat? Nat. Nat! | tag &quot;{id}&quot;</title>
      </Head>

      <h1 className="ma4">Posts with tag &quot;{id}&quot;</h1>

      <ul className="list pl0">
        {postsByTag.map((post) => (
          <li className="mb5 ml4 mr3" key={post.id}>
            <div className="f6 db pb1 gray">
              <span className="mr3">#{post.id}</span>
              <Datetime>{post.datetime}</Datetime>
            </div>
            <Link href={`/post/${post.id}`}>
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
