import { useRouter } from "next/router";
import { useQuery, gql } from "@apollo/client";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post, { getPost } from "../../components/Post";
import { initializeApollo } from "../../lib/apollo";

const Page = (props) => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }
  const { pid } = router.query;
  return (
    <App>
      <Header noLogo />
      <Post id={pid} comments />
      <Footer />
    </App>
  );
};

export async function getStaticProps(context) {
  const { pid } = context.params;

  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: getPost,
    variables: { id: pid },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}

export async function getStaticPaths() {
  const apolloClient = initializeApollo();

  const result = await apolloClient.query({
    query: gql`
      query postIDs($offset: Int!, $perpage: Int!) {
        posts(input: { limit: $perpage, offset: $offset }) {
          id
        }
      }
    `,
    variables: {
      offset: 0,
      perpage: 500,
    },
  });

  return {
    paths: result["data"]["posts"].map(function (d) {
      return { params: { pid: d.id } };
    }),
    fallback: false,
  };
}

export default Page;
