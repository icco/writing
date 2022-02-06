import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import Tag from "components/Tag"

const Page = ({ id, posts }) => {
  return (
    <App>
      <Header noLogo />
      <Tag id={id} posts={posts} />
      <Footer />
    </App>
  )
}

export async function getStaticProps(context) {
  const { id } = context.params;

  const apolloClient = initializeApollo();
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
  const apolloClient = initializeApollo();

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
  };
}

export default Page
