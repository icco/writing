import React from "react";
import ReactMde from "react-mde";
import md from "../lib/markdown.js";

import "react-mde/lib/styles/css/react-mde-all.css";
import "@fortawesome/fontawesome-free/js/all.js";

export default class EditPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "**Hello world!!!**",
    };
    this.converter = md;
  }

  handleValueChange = value => {
    this.setState({ value });
  };

  render() {
    return (
      <>
        <div className="ma3 mw8 center">
          <ReactMde
            onChange={this.handleValueChange}
            value={this.state.value}
            generateMarkdownPreview={markdown =>
              Promise.resolve(this.converter.render(markdown))
            }
          />
        </div>
      </>
    );
  }
}
