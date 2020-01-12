import { useRouter } from "next/router";
import { withApollo } from "@icco/react-common";

import App from "../../components/App";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Tag from "../../components/Tag";

const Page = props => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }

  const { id } = router.query;
  return (
    <App>
      <Header noLogo />
      <Tag id={id} />
      <Footer />
    </App>
  );
};

export default withApollo(Page);
