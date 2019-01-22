import React from "react";
import ReactMde from "react-mde";
import md from "../lib/markdown.js";
import { graphql, Mutation } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import { withRouter } from "next/router";

import "react-mde/lib/styles/css/react-mde-all.css";
import "@fortawesome/fontawesome-free/js/all.js";

const SavePost = gql`
  mutation SavePost(
    $id: String!
    $content: String!
    $title: String!
    $datetime: Time!
    $draft: Boolean!
  ) {
    editPost(
      Id: $id
      input: {
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

class EditPost extends React.Component {
  constructor(props) {
    super(props);

    let value = props.error ? props.post.content : "";

    this.state = { value };
    this.converter = md;
  }

  handleValueChange = value => {
    this.setState({ value });
  };

  handleBasicChange = event => {
    let tmp = {};
    tmp[event.target.name] = event.target.value;
    this.setState(tmp);
  };

  render() {
    const {
      data: { error, post },
    } = this.props;

    if (error) return <ErrorMessage message="Page not found." />;
    if (post) {
      if (this.state.value == "" && post.content != "") {
        this.state.value = post.content;
      }

      return (
        <section className="ma3 mw8 center">
          <h2>Edit Post #{post.id}</h2>

          <Mutation mutation={SavePost}>
            {(savePost, { data }) => (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  savePost({
                    variables: {
                      title: this.state.title,
                      content: this.state.value,
                      draft: this.state.draft,
                      datetime: this.state.datetime,
                      id: post.id,
                    },
                  });
                }}
              >
                <div>
                  <label for="title" className="f6 b db mb2">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="input-reset ba b--black-20 pa2 mb2 db w-100"
                    type="text"
                    aria-describedby="title-desc"
                    value={post.title}
                    onChange={this.handleBasicChange}
                  />
                </div>

                <label for="text" className="f6 b db mb2">
                  Post Text
                </label>
                <ReactMde
                  onChange={this.handleValueChange("value")}
                  value={this.state.value}
                  generateMarkdownPreview={markdown =>
                    Promise.resolve(this.converter.render(markdown))
                  }
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
                    <label for="draft" className="lh-copy">
                      Draft?
                    </label>
                    <input
                      className="mh2"
                      type="checkbox"
                      id="draft"
                      name="draft"
                      checked={post.draft}
                      onChange={this.handleBasicChange}
                    />
                  </div>

                  <div className="fl">
                    <label for="datetime" className="f6 b db mb2">
                      Post Time
                    </label>
                    <input
                      id="datetime"
                      type="datetime-local"
                      name="datetime"
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                      value={post.datetime.slice(0, 16)}
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
                </div>
              </form>
            )}
          </Mutation>
        </section>
      );
    }

    return <section />;
  }
}

export const getPost = gql`
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

export default graphql(getPost, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(withRouter(EditPost));
