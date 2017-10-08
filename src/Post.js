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
          <title>{`Nat? Nat. Nat! #${post.id} - "${post.title}"`}</title>
          </Helmet>

          <div className="vat mt0 mb0 dib w-100 mh0" key={post.id}>
            <Link className="no-underline black dim" to={`/post/${post.id}`}>
              <h2 className="lh-title georgia fw1 ph0 mb1">{post.title}</h2>
            </Link>
            <div>
              <p className="mv0 f6"><Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{post.date}</Moment>. {Math.ceil(post.readtime / 60)} minute read.</p>
            </div>
            <div className="f5 db lh-copy measure-wide">
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
