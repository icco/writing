import Editor from "rich-markdown-editor";
import Link from "next/link";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { useMutation } from "@apollo/react-hooks";

import { getToken } from "../lib/auth.js";
import theme from "./editorTheme";

const baseUrl = process.env.GRAPHQL_ORIGIN.substring(
  0,
  process.env.GRAPHQL_ORIGIN.lastIndexOf("/")
);

export const saveCommentMutation = gql`
  mutation saveComment($postid: ID!, $content: String!) {
    addComment(input: { content: $content, post_id: $postid }) {
      content
      modified
    }
  }
`;

export default function CommentEditor({ postID, loggedInUser }) {
  let content = "";
  const handleEditorChange = value => {
    content = value();
  };

  const [saveComment] = useMutation(saveCommentMutation);

  const addComment = content => {
    saveComment({
      variables: {
        postid: postID,
        content,
      },
    });
  };

  if (!loggedInUser) {
    return (
      <p>
        <Link key="/auth/sign-in" href="/auth/sign-in">
          <a className="link dim" href="/auth/sign-in">
            Sign in or create an account
          </a>
        </Link>{" "}
        to post a comment.
      </p>
    );
  }

  return (
    <section className="pa3 mw8 center">
      <h2>Add a comment</h2>

      <form
        onSubmit={e => {
          e.preventDefault();
          addComment(content);
        }}
      >
        <Editor
          id="content"
          name="content"
          className="db border-box w-100 pa2 br2 mb2"
          aria-describedby="text-desc"
          onChange={handleEditorChange}
          defaultValue={content}
          theme={theme}
        />

        <div className="pv3 cf">
          <input
            type="submit"
            value="Save"
            className="fr pointer dim br3 ph3 pv2 mb2 dib white bg-navy"
          />
        </div>
      </form>
    </section>
  );
}
