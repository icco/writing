import Router from "next/router";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import {
  Loading,
  ErrorMessage,
  withApollo,
  useLoggedIn,
} from "@icco/react-common";
import { withAuth, withLoginRequired } from "use-auth0-hooks";

import NotAuthorized from "../../components/NotAuthorized";

const NewPost = gql`
  mutation {
    createPost(input: { draft: true }) {
      id
    }
  }
`;

const Page = props => {
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
