import Head from "next/head";

import App from "components/App";
import Header from "components/Header";
import Footer from "components/Footer";
import PostList, { allPosts, allPostsQueryVars } from "components/PostList";

import { initializeApollo } from "lib/apollo";

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

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default Index;
