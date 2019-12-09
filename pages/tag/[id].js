import { useRouter } from "next/router";

import App from "../../components/App";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Tag from "../../components/Tag";
import withError from "../../lib/withError";

const Page = withError(props => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <App>
      <Header />
      <Tag id={id} />
      <Footer />
    </App>
  );
});

export default Page;
