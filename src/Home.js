import React, { Component } from 'react';
import { Link } from 'react-router'
import styled from 'tachyons-components'
import Moment from 'react-moment';
import 'moment-timezone';

const PostHolder = styled('div')`ma4`
const PostHeader = styled('h2')`pb2`
const PostSummary = styled('div')``
const PostMeta = styled('div')``
const PostDate = styled('div')``

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
            <PostHolder key={post.id}>
            <Link to={`/post/${post.id}`}><PostHeader>{post.title}</PostHeader></Link>
            <PostMeta>
              <PostDate><Moment interval={0}>{post.date}</Moment></PostDate>
            </PostMeta>
            <PostSummary dangerouslySetInnerHTML={{__html: post.html}}></PostSummary>
            </PostHolder>
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
