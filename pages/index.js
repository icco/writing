import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList from "../components/PostList";
import Head from "next/head";

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
  console.log(loggedInUser);

  return {
    loggedInUser,
  };
};

export default Index;
