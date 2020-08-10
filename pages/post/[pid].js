import { gql } from "@apollo/client";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post, { getPost } from "../../components/Post";
import { useApollo } from "../../lib/apollo";

const Page = (props) => {
  return (
    <App>
      <Header noLogo />
      <Post id={props.pid} comments />
      <Footer />
    </App>
  );
};

export async function getStaticProps(context) {
  const apolloClient = useApollo();

  const { pid } = context.params;
  await apolloClient.query({
    query: getPost,
    variables: { id: pid },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      pid,
    },
  };
}

export async function getStaticPaths() {
  const apolloClient = useApollo();

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
    fallback: false,
  };
}

export default Page;
