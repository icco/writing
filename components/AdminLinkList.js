import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";

function AdminLinkList({ data: { error, links } }) {
  if (error) {
    return <ErrorMessage message="Error loading links." />;
  }

  if (links && links.length) {
    return (
      <section className="pa3 mw8 center">
        <ul className="list pl0" key="link-ul">
          {links.map(l => (
            <li className="mv3" key={"link-" + l.id}>
              <span className="mr3">{l.created}</span>
              <Link href={l.uri}>
                <a className="link dark-blue dim">{l.title}</a>
              </Link>{" "}
              - <span className="gray">{l.uri}</span>
              <blockquote>{l.description}</blockquote>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <div />;
}

export const SomeLinks = gql`
  query someLinks {
    links(limit: 50, offset: 0) {
      id
      uri
      title
      created
      description
    }
  }
`;

export default graphql(SomeLinks, {})(AdminLinkList);
