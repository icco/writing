import Head from "next/head";

import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList from "../components/PostList";
import withError from "../lib/withError";
import { withApollo } from "../lib/apollo";

const Index = withError(props => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat!</title>
      </Head>
      <Header loggedInUser={props.loggedInUser} />
      <PostList />
      <Footer />
    </App>
  );
});

export default withApollo(Index);
