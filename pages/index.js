import Head from "next/head";

import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostList, { allPosts, allPostsQueryVars } from "../components/PostList";

import { useApollo } from "../lib/apollo";

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

export async function getStaticProps(context) {
  const apolloClient = useApollo();

  await apolloClient.query({
    query: allPosts,
    variables: allPostsQueryVars,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}

export default Index;
