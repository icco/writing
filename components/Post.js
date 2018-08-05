import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from './ErrorMessage'
import { withRouter } from 'next/router'

const Post = (props) => {
  const { id, router: { asPath }, data } = props;

  return (
    <div>
      #{data.post.id}

      <h1>{data.post.title}</h1>
      <div>
        {data.post.content}
      </div>
    </div>
  )
}

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
