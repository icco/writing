import React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import { withRouter } from "next/router";
import "@fortawesome/fontawesome-free/js/all.js";
import Link from "next/link";
import Editor from "rich-markdown-editor";
import { ErrorMessage, Loading } from "@icco/react-common";

import { getToken } from "../lib/auth.js";

const baseUrl = process.env.GRAPHQL_ORIGIN.substring(
  0,
  process.env.GRAPHQL_ORIGIN.lastIndexOf("/")
);

const SavePost = gql`
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

const GetPost = gql`
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

class EditPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      title: "",
      datetime: "",
    };
  }

  handleBasicChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleEditorChange = value => {
    this.setState({
      content: value(),
    });
  };

  draft = postDraft => {
    if (!("draft" in this.state)) {
      return postDraft;
    }

    return this.state.draft;
  };

  render() {
    return (
      <Query
        query={GetPost}
        variables={{ id: this.props.id }}
        fetchPolicy={"network-only"}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return <Loading key={0} />;
          }

          if (error) {
            return <ErrorMessage message="Page not found." />;
          }

          let post = data.post;
          return (
            <section className="pa3 mw8 center">
              <h2>Edit Post #{post.id}</h2>

              <Mutation mutation={SavePost}>
                {(savePost, { data }) => (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      savePost({
                        variables: {
                          title: this.state.title || post.title,
                          content: this.state.content || post.content,
                          draft: this.draft(post.draft),
                          datetime: this.state.datetime || post.datetime,
                          id: post.id,
                        },
                        refetchQueries: [
                          { query: GetPost, variables: { id: post.id } },
                        ],
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
                        value={this.state.title || post.title}
                        onChange={this.handleBasicChange}
                      />
                    </div>

                    <label htmlFor="content" className="f6 b db mb2">
                      Post Text
                    </label>

                    <Editor
                      id="content"
                      name="content"
                      className="db border-box hover-black w-100 ba b--black-20 pa2 br2 mb2"
                      aria-describedby="text-desc"
                      onChange={this.handleEditorChange}
                      defaultValue={this.state.content || post.content}
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
                          checked={this.draft(post.draft)}
                          onChange={this.handleBasicChange}
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
                          value={this.state.datetime || post.datetime}
                          onChange={this.handleBasicChange}
                        />
                      </div>
                    </div>
                    <div className="pv3 cf">
                      <input
                        type="submit"
                        value="Save"
                        className="fr pointer dim br3 ph3 pv2 mb2 dib white bg-navy"
                      />
                      <Link href={`/post/${post.id}`}>
                        <a className="mh3 dib mv2 link pointer dim gray fr ttu">
                          View Live Post
                        </a>
                      </Link>
                    </div>
                  </form>
                )}
              </Mutation>
            </section>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(EditPost);
