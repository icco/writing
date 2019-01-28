import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";

function AdminDraftList({ data: { error, drafts } }) {
  if (error) {
    return <ErrorMessage message="Error loading drafts." />;
  }

  if (drafts && drafts.length) {
    return (
      <section className="mw8">
        <ul className="list pl0" key="draft-ul">
          {drafts.map(post => (
            <li className="" key={"draft-" + post.id}>
              <span className="dbi mr3">#{post.id}</span>
              <Link as={`/edit/${post.id}`} href={`/admin/post?id=${post.id}`}>
                <a className="link dark-gray dim">{post.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <div />;
}

export const allDrafts = gql`
  query drafts {
    drafts {
      id
      title
    }
  }
`;

export default graphql(allDrafts, {
  fetchPolicy: "network-only",
})(AdminDraftList);
