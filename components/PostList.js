import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from './ErrorMessage'
import Link from 'next/link'

function PostList ({
  data: { loading, error, allPosts, _allPostsMeta },
  loadMorePosts
}) {
  if (error) return <ErrorMessage message='Error loading posts.' />
  if (allPosts && allPosts.length) {
    return (
      <section>
        <ul>
          {allPosts.map((post) => (
            <li key={post.id}>
              <div>
                <span>#{post.id} </span>
                <Link href={`/post/${post.id}`}><a>{post.title}</a></Link>
              </div>
            </li>
          ))}
        </ul>
        <style jsx>{`
        `}</style>
      </section>
    )
  }
  return <div>Loading</div>
}

export const allPosts = gql`
  query allPosts {
    allPosts {
      id
      title
    }
  }
`

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
export default graphql(allPosts, {
  options: {
  },
  props: ({ data }) => {
    return ({
      data,
      loadMorePosts: () => {
        return data.fetchMore({
          variables: {
            skip: data.allPosts.length
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return previousResult
            }
            return Object.assign({}, previousResult, {
              // Append the new posts results to the old one
              allPosts: [...previousResult.allPosts, ...fetchMoreResult.allPosts]
            })
          }
        })
      }
    })
  }
})(PostList)
