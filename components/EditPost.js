import * as React from "react";
import ReactMde from "../src";
import * as Showdown from "showdown";

export class EditPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "**Hello world!!!**",
    };
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
    });
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
            Promise.resolve(this.converter.makeHtml(markdown))
          }
        />
      </div>
    );
  }
}
