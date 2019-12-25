import { useRouter } from "next/router";

import App from "../../components/App";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Tag from "../../components/Tag";
import withError from "../../lib/withError";
import { checkLoggedIn } from "../../lib/auth";

const Page = withError(props => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }

  const { id } = router.query;
  return (
    <App>
      <Header loggedInUser={props.loggedInUser} noLogo />
      <Tag id={id} />
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
