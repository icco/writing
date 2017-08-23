import React, { Component } from 'react';
import { Helmet } from "react-helmet";

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }

  componentWillMount() {
    let slug = this.props.params.slug;

    fetch(`https://writing.natwelch.com/post/${slug}/json`)
      .then((response) => response.json())
      .then((resp) => {
        console.log(resp);
        this.setState({
          loaded: true,
          post: resp
        })
      });
  }

  render() {
    if (this.state.loaded) {
      const post = this.state.post;

      return (
        <div>
          <Helmet>
          <title>Nat? Nat. Nat! #post.id - "post.title"</title>
          </Helmet>

          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{__html: post.text}} />
        </div>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      );
    }
  }
}

export default Post;
