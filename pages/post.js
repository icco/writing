import { withRouter } from "next/router";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { checkLoggedIn } from "../lib/auth";
import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Post from "../components/Post";
import WithError from "../components/WithError";

const Page = withRouter(props => (
  <App>
    <Header loggedInUser={props.loggedInUser} />
    <Post id={props.router.query.id} />
    <Footer />
  </App>
));

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);
  console.log(ctx.data);
  
  if (ctx.data.error) {
    return {
      statusCode: 404
    }
  }

  return {
    loggedInUser,
    id: ctx.query.id,
    data: ctx.data
  };
};


export const getPost = gql`
  query getPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
      next {
        id
      }
      prev {
        id
      }
    }
  }
`;

export default WithError(graphql(getPost, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(Page));
