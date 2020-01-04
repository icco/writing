import gql from "graphql-tag";
import "@fortawesome/fontawesome-free/js/all.js";
import Link from "next/link";
import Editor from "rich-markdown-editor";
import { ErrorMessage, Loading } from "@icco/react-common";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useState } from "react";

import theme from "./editorTheme";
import { getToken } from "../lib/auth.js";

const baseUrl = process.env.GRAPHQL_ORIGIN.substring(
  0,
  process.env.GRAPHQL_ORIGIN.lastIndexOf("/")
);

const savePostMutation = gql`
  mutation SavePost(
    $id: ID!
    $content: String!
    $title: String!
    $datetime: Time!
    $draft: Boolean!
  ) {
    editPost(
      input: {
        id: $id
        content: $content
        title: $title
        datetime: $datetime
        draft: $draft
      }
    ) {
      id
      title
      content
      datetime
      draft
    }
  }
`;

const getPostQuery = gql`
  query getEditPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
      draft
    }
  }
`;

export default function EditPost({ id, loggedInUser }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState();
  const [draft, setDraft] = useState();
  const [datetime, setDatetime] = useState();

  const setters = {
    title: setTitle,
    content: setContent,
    draft: setDraft,
    datetime: setDatetime,
  };

  const handleBasicChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setters[name](value);
  };

  const handleEditorChange = value => {
    setContent(value());
  };

  const [savePost] = useMutation(savePostMutation);
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    getPostQuery,
    {
      variables: { id },
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Loading key={0} />;
  }

  if (error) {
    return <ErrorMessage message="Page not found." />;
  }

  const { post } = data;

  if (!post) {
    const e = new Error();
    e.code = "ENOENT";
    e.message = "Post not found";
    throw e;
  }

  setDraft(post.draft);
  setContent(post.content);
  setDatetime(post.datetime);
  setTitle(post.title);

  return (
    <section className="pa3 mw8 center">
      <h2>Edit Post #{post.id}</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          savePost({
            variables: {
              title,
              content,
              draft,
              datetime,
              id,
            },
            refetchQueries: [{ query: getPostQuery, variables: { id } }],
            awaitRefetchQueries: true,
          });
        }}
      >
        <div>
          <label htmlFor="title" className="f6 b db mb2">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="input-reset ba b--black-20 pa2 mb2 db w-100"
            type="text"
            aria-describedby="title-desc"
            value={title}
            onChange={handleBasicChange}
          />
        </div>

        <label htmlFor="content" className="f6 b db mb2">
          Post Text
        </label>

        <Editor
          id="content"
          name="content"
          className="db border-box w-100 pa2 br2 mb2"
          theme={theme}
          aria-describedby="text-desc"
          onChange={handleEditorChange}
          defaultValue={content}
          uploadImage={async file => {
            let token = getToken();

            let formData = new FormData();
            formData.append("file", file);
            let response = await fetch(`${baseUrl}/photo/new`, {
              method: "POST",
              body: formData,
              headers: {
                authorization: token ? `Bearer ${token}` : "",
              },
            });

            let data = await response.json();
            return data.file;
          }}
        />

        <small id="text-desc" className="f6 black-60">
          This should be in{" "}
          <a
            href="https://spec.commonmark.org/0.28/"
            className="link underline black-80 hover-blue"
          >
            Markdown
          </a>
          .
        </small>

        <div className="mt3 cf">
          <div className="fr">
            <label htmlFor="draft" className="lh-copy">
              Draft?
            </label>
            <input
              className="mh2"
              type="checkbox"
              id="draft"
              name="draft"
              checked={draft}
              onChange={handleBasicChange}
            />
          </div>

          <div className="fl">
            <label htmlFor="datetime" className="f6 b db mb2">
              Post Time
            </label>
            <input
              id="datetime"
              type="text"
              name="datetime"
              className="input-reset ba b--black-20 pa2 mb2 db w-100"
              value={datetime}
              onChange={handleBasicChange}
            />
          </div>
        </div>
        <div className="pv3 cf">
          <input
            type="submit"
            value="Save"
            className="fr pointer dim br3 ph3 pv2 mb2 dib white bg-navy"
          />
          <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
            <a className="mh3 dib mv2 link pointer dim gray fr ttu">
              View Live Post
            </a>
          </Link>
        </div>
      </form>
    </section>
  );
}
