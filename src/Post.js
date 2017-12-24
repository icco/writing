import React from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router'
import Moment from 'react-moment';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

function PostComponent({ data: {Post, error, loading}}) {
  if (loading) {
    return <p>Loading...</p>;
  } else if (error) {
    console.log(error);
    return <p>Error!</p>;
  } else {
    console.log(Post);
    return (
      <div>
        <Helmet>
          <title>{`Nat? Nat. Nat! #${Post.Id} - "${Post.Title}"`}</title>
        </Helmet>

        <div className="vat mt3 mb0 dib w-100 mh0" key={Post.Id}>
          <Link className="no-underline dim" to={`/post/${Post.Id}`}>
            <h2 className="f2-ns f3 measure lh-title fw1 mt0 mb1">{Post.Title}</h2>
          </Link>
          <p className="mt0 f5-ns f6 db mb3"><Moment className="dib" interval={0} format="MMM. Do YYYY, h a z">{Post.Datetime}</Moment>. {Math.ceil(Post.Readtime / 60)} minute read.</p>
          <div className="db lh-copy">
            <div className="dib" dangerouslySetInnerHTML={{__html: Post.Html}}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default graphql(gql`
  query PostQuery {
    Post(Id: 677) {
      Id
      Title
      Datetime
    }
  }
`)(PostComponent);
