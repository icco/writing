import { gql, getApolloContext } from "@apollo/client";
import { useRouter } from "next/router";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post, { getPost } from "../../components/Post";

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
  return {
    props: {
      pid,
    },
  };
}

export async function getStaticPaths() {
  // ???
  useContext(getApolloContexdt())
  const result = await uery({
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
