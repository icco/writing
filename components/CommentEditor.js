import Editor from "rich-markdown-editor";
import Link from "next/link";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Loading } from "@icco/react-common";

import theme from "./editorTheme";
import { useLoggedIn } from "../lib/auth";

export const saveCommentMutation = gql`
  mutation saveComment($postid: ID!, $content: String!) {
    addComment(input: { content: $content, post_id: $postid }) {
      content
      modified
    }
  }
`;

export default function CommentEditor({ postID }) {
  const { loading, login, error, loggedInUser } = useLoggedIn();
  const { asPath } = useRouter();

  if (error) {
    if (error.error != "consent_required") {
      throw error;
    }
  }

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

  if (loading) {
    return (
      <>
        <div className="">
          <Loading key={0} />
        </div>
      </>
    );
  }

  if (!loggedInUser) {
    return (
      <p>
        <a
          className="link dim pointer"
          onClick={() => login({ appState: { returnTo: { asPath } } })}
        >
          Sign in or create an account
        </a>{" "}
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
