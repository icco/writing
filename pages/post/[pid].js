import { useRouter } from "next/router";
import gql from "graphql-tag";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post from "../../components/Post";
import { checkLoggedIn } from "../../lib/auth";
import { withApollo } from "../../lib/apollo";

const Page = props => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }
  const { pid } = router.query;
  return (
    <App>
      <Header loggedInUser={props.loggedInUser} noLogo />
      <Post id={pid} loggedInUser={props.loggedInUser} comments />
      <Footer />
    </App>
  );
};

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);
  let ret = { loggedInUser };

  if (ctx != null && ctx.query != null) {
    const { post } = await getPostID(ctx.apolloClient, ctx.query.pid);

    if (!post) {
      ret["statusCode"] = 404;
    }
  } else {
    ret["statusCode"] = 404;
  }

  return ret;
};

function getPostID(apollo, postID) {
  if (apollo == null) {
    return { post: null };
  }

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

export default withApollo(Page);
