import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router'
import Moment from 'react-moment';

class Post extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }

  componentWillMount() {
    let slug = this.props.params.slug;

    fetch(`https://natwelch-writing.appspot.com/post/${slug}/json`)
      .then((response) => response.json())
      .then((resp) => {
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
          <title>{`Nat? Nat. Nat! #${post.id} - "${post.title}"`}</title>
          </Helmet>

          <div className="vat mt3 mb0 dib w-100 mh0" key={post.id}>
            <Link className="no-underline dim" to={`/post/${post.id}`}>
              <h2 className="f2-ns f3 measure lh-title fw1 mt0 mb1">{post.title}</h2>
            </Link>
            <p className="mt0 f5-ns f6 db mb3"><Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{post.date}</Moment>. {Math.ceil(post.readtime / 60)} minute read.</p>
            <div className="db lh-copy">
              <div className="dib" dangerouslySetInnerHTML={{__html: post.html}}></div>
            </div>
          </div>
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
