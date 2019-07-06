import React from "react";
import Router from "next/router";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import Error from "next/error";
import { ErrorMessage, Loading } from "@icco/react-common";

import NotAuthorized from "../../components/NotAuthorized";
import { checkLoggedIn } from "../../lib/auth";
import { initApollo } from "../../lib/init-apollo";

const NewPost = gql`
  mutation {
    createPost(input: { draft: true }) {
      id
    }
  }
`;

export default class extends React.Component {
  async componentDidMount() {
    this.state = this.state ? this.state : {};
    const { loggedInUser } = await checkLoggedIn(initApollo());
    this.setState({ loggedInUser });
  }

  render() {
    if (
      !this.state ||
      !this.state.loggedInUser ||
      !this.state.loggedInUser.role ||
      this.state.loggedInUser.role !== "admin"
    ) {
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
  }
}
