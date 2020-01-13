import { useRouter } from "next/router";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Post from "../../components/Post";
import { withApollo } from "../../lib/apollo";

const Page = props => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }
  return (
    <App>
      <Header noLogo />
      <Search query={router.query} />
      <Footer />
    </App>
  );
};

export default withApollo(Page);
