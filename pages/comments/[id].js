import { useRouter } from "next/router";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const Page = props => {
  const router = useRouter();
  const { pid } = router.query;
  return (
    <App>
      <Header noLogo />
      <p>This is not implemented yet.</p>
      <Footer />
    </App>
  );
};

export default Page;
