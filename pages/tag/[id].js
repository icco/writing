import { useRouter } from "next/router";
import { gql } from "@apollo/client";

import App from "../../components/App";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Tag, { getTag } from "../../components/Tag";
import { useApollo } from "../../lib/apollo";

const Page = (props) => {
  const { id } = props;
  return (
    <App>
      <Header noLogo />
      <Tag id={id} />
      <Footer />
    </App>
  );
};

export async function getStaticProps(context) {
  const { id } = context.params;

  const apolloClient = useApollo();
  await apolloClient.query({
    query: getTag,
    variables: { id },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      id,
    },
  };
}

export async function getStaticPaths() {
  const apolloClient = useApollo();

  const result = await apolloClient.query({
    query: gql`
      query tags {
        tags
      }
    `,
  });

  return {
    paths: result["data"]["tags"].map(function (d) {
      return { params: { id: d } };
    }),
    // TODO: Write a fallback function.
    fallback: false,
  };
}

export default Page;
