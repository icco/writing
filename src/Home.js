'strict';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
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
    fetch("https://natwelch-writing.appspot.com/summary.json")
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
        <div>
          <Helmet>
            <title>Nat? Nat. Nat!</title>
          </Helmet>
        {this.state.resp.map((post) => {
          return (
            <div className="vat pa2 mv2 dib w-100 mh0">
              <h2 className="lh-title fw1 ph0 mb1 mt2">
                <Link className="no-underline" to={`/post/${post.id}`} key={post.id}>{post.title}</Link>
              </h2>
              <div>
                <p className="mv0 f6">#{post.id} <Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{post.date}</Moment>. {Math.ceil(post.readtime / 60)} minute read.</p>
              </div>
              <div className="f5 db lh-copy">
                <div className="dib" dangerouslySetInnerHTML={{__html: post.html}}></div>

                <div><Link to={`/post/${post.id}`} key={post.id}>Continue Reading...</Link></div>
              </div>
            </div>
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

export default graphql(gql`
  query HomeQuery {
    posts {
      id
      title
      date
    }
  }
`)(Home);
