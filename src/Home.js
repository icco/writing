'strict';

import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router'
import Moment from 'react-moment';
import 'moment-timezone';
import 'tachyons';

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
  }

  fetchPosts(page) {
    // TODO: Add page support
    fetch("https://writing.natwelch.com/summary.json")
      .then((response) => response.json())
      .then((resp) => {
        console.debug(resp);
        this.setState({
          loaded: true,
          resp: resp
        })
      });
  }

  componentWillMount() {
    let page = this.props.params.page || 1;

    this.fetchPosts(page)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({loaded: false});

    let page = nextProps.params.page || 1;

    this.fetchPosts(page)
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="w6">
          <Helmet>
            <title>Nat? Nat. Nat!</title>
          </Helmet>
        {this.state.resp.map((post) => {
          return (
            <Link className="no-underline black dim" to={`/post/${post.id}`}>
              <div className="vat mt0 mb0 dib w-50-ns w-100 mh0" key={post.id}>
                <h2 className="lh-title georgia fw1 ph0 mb1">{post.title}</h2>
                <div>
                  <p className="mv0 f6"><Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{post.date}</Moment>. {Math.ceil(post.readtime / 60)} minute read.</p>
                </div>
                <div className="f5 db lh-copy measure">
                  <div className="dib" dangerouslySetInnerHTML={{__html: post.html}}></div>
                </div>
              </div>
            </Link>
          )
        })}
        </div>
      );
    } else {
      return (
        <div>
        Loading...
        </div>
      )
    }
  }
}

export default Home;
