import Router from "next/router";
import { gql } from "@apollo/client";
import { Mutation } from "@apollo/client";
import { Loading, ErrorMessage } from "@icco/react-common";
import { withAuth, withLoginRequired } from "use-auth0-hooks";

import NotAuthorized from "../../components/NotAuthorized";
import { withApollo } from "../../lib/apollo";
import { useLoggedIn } from "../../lib/auth";

const NewPost = gql`
  mutation {
    createPost(input: { draft: true }) {
      id
    }
  }
`;

const Page = (props) => {
  const { loggedInUser } = useLoggedIn();
  if (!loggedInUser || loggedInUser.role !== "admin") {
    return <NotAuthorized />;
  }

  return (
    <Mutation mutation={NewPost}>
      {(newPost, { loading, error, data }) => {
        if (loading) {
          return <Loading key={0} />;
        }
        if (error) {
          return <ErrorMessage message="Page not found." />;
        }

        if (data) {
          Router.push(`/edit/${data.createPost.id}`);
        } else {
          newPost();
        }
        return null;
      }}
    </Mutation>
  );
};

export default withLoginRequired(withAuth(withApollo(Page)));
