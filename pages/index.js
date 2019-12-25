import Head from "next/head";

import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList from "../components/PostList";

import { checkLoggedIn } from "../lib/auth";
import { withApollo } from '../lib/apollo'

const Index = props => (
  <App>
    <Head>
      <title>Nat? Nat. Nat!</title>
    </Head>
    <Header loggedInUser={props.loggedInUser} />
    <PostList />
    <Footer />
  </App>
);

Index.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);

  return {
    loggedInUser,
  };
};

export default withApollo(Index);
