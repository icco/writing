'strict';

import React, { Component } from 'react';
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
        <div>
        {this.state.resp.map((post) => {
          return (
            <div className="ma4" key={post.id}>
            <Link to={`/post/${post.id}`}><h2 className="pb2">{post.title}</h2></Link>
            <div>
              <Moment interval={0}>{post.date}</Moment>
            </div>
            <div dangerouslySetInnerHTML={{__html: post.html}}></div>
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

export default Home;
