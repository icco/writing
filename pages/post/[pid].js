import { gql } from "@apollo/client";
import { useRouter } from "next/router";
  import fetch from 'node-fetch';
  import { abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill';

import App from "components/App";
import Footer from "components/Footer";
import Header from "components/Header";
import Post, { getPost } from "components/Post";
import { initializeApollo, addApolloState } from 'lib/apollo'

const Page = (props) => {
  const router = useRouter();
  const { pid } = router.query;

  if (props.pid) {
    pid = props.pid;
  }

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

  return addApolloState(apolloClient, {
    props: { pid },
    revalidate: 1,
  })
}

export async function getStaticPaths() {

  global.fetch = abortableFetch(fetch).fetch;
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
      perpage: 2000,
    },
  });

  return {
    paths: result["data"]["posts"].map(function (d) {
      return { params: { pid: d.id } };
    }),
    fallback: true,
    revalidate: 1,
  };
}

export default Page;
