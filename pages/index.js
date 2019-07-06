import Head from "next/head";
import { Header } from "@icco/react-common";

import App from "../components/App";
import Footer from "../components/Footer";
import PostList from "../components/PostList";
import { checkLoggedIn } from "../lib/auth";

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

export default Index;
