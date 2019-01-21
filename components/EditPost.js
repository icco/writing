import React from "react";
import ReactMde from "react-mde";
import md from "../lib/markdown.js";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import { withRouter } from "next/router";

import "react-mde/lib/styles/css/react-mde-all.css";
import "@fortawesome/fontawesome-free/js/all.js";

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
          <div>
            <label for="title" class="f6 b db mb2">
              Title
            </label>
            <input
              id="title"
              name="title"
              class="input-reset ba b--black-20 pa2 mb2 db w-100"
              type="text"
              aria-describedby="title-desc"
              value={post.title}
            />
          </div>

          <label for="text" class="f6 b db mb2">
            Post Text
          </label>
          <ReactMde
            onChange={this.handleValueChange}
            value={this.state.value}
            generateMarkdownPreview={markdown =>
              Promise.resolve(this.converter.render(markdown))
            }
          />
          <small id="text-desc" class="f6 black-60">
            This should be in{" "}
            <a
              href="https://spec.commonmark.org/0.28/"
              class="link underline black-80 hover-blue"
            >
              Markdown
            </a>
            .
          </small>

          <div class="mt3 cf">
            <div class="fr">
              <label for="draft" class="lh-copy">
                Draft?
              </label>
              <input
                class="mh2"
                type="checkbox"
                id="draft"
                name="draft"
                checked={post.draft}
              />
            </div>

            <div class="fl">
              <label for="datetime" class="f6 b db mb2">
                Post Time
              </label>
              <input
                id="datetime"
                type="datetime-local"
                name="datetime"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                value={post.datetime.slice(0, 16)}
              />
            </div>
          </div>
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
