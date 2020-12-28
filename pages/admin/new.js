import { useRouter } from "next/router";
import { gql, useMutation } from "@apollo/client";
import { Loading, ErrorMessage } from "@icco/react-common";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import NotAuthorized from "components/NotAuthorized";

const newPostMutation = gql`
  mutation {
    createPost(input: { draft: true }) {
      id
    }
  }
`;

const Page = (props) => {
  const router = useRouter();
  const [newPost, { loading, error, data, called }] = useMutation(
    newPostMutation
  );

  if (!called) {
    newPost();
  }

  if (loading) {
    return <Loading key={0} />;
  }

  if (error) {
    return <ErrorMessage error={error} message="Could not create new post." />;
  }

  if (data) {
    router.push(`/edit/${data.createPost.id}`);
  }

  return (
    <>
      <p>Creating new post...</p>
    </>
  );
};

export default withAuthenticationRequired(Page);
