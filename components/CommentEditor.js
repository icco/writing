import Editor from "rich-markdown-editor";
import Link from "next/link";
import React from "react";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { Query, Mutation } from "react-apollo";
import { withRouter } from "next/router";

import { getToken } from "../lib/auth.js";

const baseUrl = process.env.GRAPHQL_ORIGIN.substring(
  0,
  process.env.GRAPHQL_ORIGIN.lastIndexOf("/")
);

const SaveComment = gql`
  mutation SaveComment(
    $postid: ID!
    $content: String!
  ) {
    addComment(
      input: {
        content: $content
        post_id: $postid
      }
    ) {
      content
      modified
    }
  }
`;

class CommentEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      postID: props.postID,
    };
  }

  handleEditorChange = value => {
    this.setState({
      content: value(),
    });
  };

  render() {
    if (!this.props.loggedInUser) {
      return (
        <p>
        <Link key="/auth/sign-in" href="/auth/sign-in">
          <a className="link dim" href="/auth/sign-in">
            Sign in or create an account
          </a>
        </Link> to post a comment.
        </p>
      )
    }

    return (
      <section className="pa3 mw8 center">
        <h2>Add a comment</h2>

        <Mutation mutation={SaveComment}>
          {(saveComment, { data }) => (
            <form
              onSubmit={e => {
                e.preventDefault();
                saveComment({
                  variables: {
                    content: this.state.content,
                    postid: this.state.postID,
                  },
                });
              }}
            >
              <Editor
                id="content"
                name="content"
                className="db border-box hover-black w-100 ba b--black-20 pa2 br2 mb2 bg-white"
                aria-describedby="text-desc"
                onChange={this.handleEditorChange}
                defaultValue={this.state.content}
              />

              <div className="pv3 cf">
                <input
                  type="submit"
                  value="Save"
                  className="fr pointer dim br3 ph3 pv2 mb2 dib white bg-navy"
                />
              </div>
            </form>
          )}
        </Mutation>
      </section>
    );
  }
}

export default withRouter(CommentEditor);
