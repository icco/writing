import { useRouter } from "next/router";

import App from "../../components/App";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import withError from "../../lib/withError";
import { checkLoggedIn } from "../../lib/auth";

const Page = withError(props => {
  const router = useRouter();
  const { pid } = router.query;
  return (
    <App>
      <Header loggedInUser={props.loggedInUser} noLogo />
      <p>This is not implemented yet.</p>
      <Footer />
    </App>
  );
});

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);
  let ret = { loggedInUser };

  return ret;
};

export default Page;
