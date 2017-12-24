'strict';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router'
import Moment from 'react-moment';
import 'moment-timezone';
import 'tachyons';

function Home({ data: { Posts, refetch } }) {
  return (
      <div>
        <Helmet>
          <title>Nat? Nat. Nat!</title>
        </Helmet>
      {Posts && Posts.map((post) => {
        return (
          <div className="vat pa2 mv2 dib w-100 mh0">
            <h2 className="lh-title fw1 ph0 mb1 mt2">
              <Link className="no-underline" to={`/post/${post.Id}`} key={post.Id}>{post.Title}</Link>
            </h2>
            <div>
              <p className="mv0 f6">#{post.Id} <Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{post.Datetime}</Moment>. {Math.ceil(post.Readtime / 60)} minute read.</p>
            </div>
            <div className="f5 db lh-copy">
              <div className="dib" dangerouslySetInnerHTML={{__html: post.SummaryHtml}}></div>

              <div><Link to={`/post/${post.Id}`} key={post.Id}>Continue Reading...</Link></div>
            </div>
          </div>
        )
      })}
      </div>
  );
}

// TODO: add Readtime, SummaryHtml
export default graphql(gql`
  query HomeQuery {
    Posts {
      Id
      Title
      Datetime
    }
  }
`)(Home);
