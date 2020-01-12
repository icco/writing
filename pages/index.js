import Head from "next/head";
import {  withApollo, } from "@icco/react-common";

import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList from "../components/PostList";

const Index = () => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat!</title>
        <meta
          name="Description"
          content="Nat Welch's blog about life and software."
        />
      </Head>
      <Header />
      <PostList />
      <Footer />
    </App>
  );
};

export default withApollo(Index);
