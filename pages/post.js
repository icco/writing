import { withRouter } from "next/router";
import gql from "graphql-tag";

import App from "../components/App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Post from "../components/Post";
import withError from "../lib/withError";
import { checkLoggedIn } from "../lib/auth";

const Page = withError(
  withRouter(props => (
    <App>
      <Header loggedInUser={props.loggedInUser} />
      <Post id={props.router.query.id} />
      <Footer />
    </App>
  ))
);

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);
  const { post } = await getPostID(ctx.apolloClient, ctx.query.id);
  let ret = { loggedInUser };

  if (!post) {
    ctx.res.statusCode = 404
    ret["statusCode"] = 404;
  }

  return ret;
};

function getPostID(apollo, postID) {
  return apollo
    .query({
      query: gql`
        query getPost($id: ID!) {
          post(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: postID,
      },
    })
    .then(({ data }) => {
      return { post: data.post };
    })
    .catch(() => {
      // Fail gracefully
      return { post: null };
    });
}

export default Page;
