import { gql, useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { Loading } from "@icco/react-common";
import theme from "components/editorTheme";
import { useRouter } from "next/router";
import Editor from "rich-markdown-editor";

export const saveCommentMutation = gql`
  mutation saveComment($postid: ID!, $content: String!) {
    addComment(input: { content: $content, post_id: $postid }) {
      content
      modified
    }
  }
`;

export default function CommentEditor({ postID }) {
  const { asPath } = useRouter();
  const { isAuthenticated, isLoading, error, loginWithRedirect } = useAuth0();

  if (error) {
    if (error.error != "consent_required") {
      throw error;
    }
  }

  let content = "";
  const handleEditorChange = (value) => {
    content = value();
  };

  const [saveComment] = useMutation(saveCommentMutation);

  const addComment = (content) => {
    saveComment({
      variables: {
        postid: postID,
        content,
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="">
          <Loading key={0} />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <p>
        <a
          className="link dim pointer"
          onClick={() =>
            loginWithRedirect({ appState: { returnTo: { asPath } } })
          }
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
        onSubmit={(e) => {
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
