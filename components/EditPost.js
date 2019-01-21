import React from "react";
import ReactMde from "react-mde";
import md from "../lib/markdown.js";

export class EditPost extends React.Component {
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
      <div className="container">
        <ReactMde
          onChange={this.handleValueChange}
          value={this.state.value}
          generateMarkdownPreview={markdown =>
            Promise.resolve(this.converter.render(markdown))
          }
        />
      </div>
    );
  }
}
