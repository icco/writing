import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from './ErrorMessage'
import { withRouter } from 'next/router'
import marked from 'marked'
import Moment from 'react-moment'
import 'moment-timezone'
import Head from 'next/head'

const Post = (props) => {
  const { id, router: { asPath }, data, error, loading } = props;

  if (data.post) {
    let html = { __html: marked(data.post.content) }

    return (
      <div>
        <Head>
          <title>Nat? Nat. Nat! | #{data.post.id} {data.post.title}</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" key="viewport" />
        </Head>
        <div>#{data.post.id}</div>
        <Moment format="YYYY-MM-DD">{data.post.datetime}</Moment>

        <h1>{data.post.title}</h1>
        <div dangerouslySetInnerHTML={html}></div>
      </div>
    )
  } else {
    throw notFoundError()
  }
}

function notFoundError () {
  const err = new Error(`this will not show up anywhere`)
  err.code = 'ENOENT'
  return err
}

// call this in render if something is missing

export const getPost = gql`
  query getPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
    }
  }
`

export default graphql(getPost, {
  options: (props) => ({
    variables: {
      id: props.id
    }
  })
})(withRouter(Post));
