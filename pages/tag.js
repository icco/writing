import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Tag from "../components/Tag";
import { withRouter } from "next/router";

import { checkLoggedIn } from "../lib/auth";

const Page = withRouter(props => (
  <App>
    <Header loggedInUser={props.loggedInUser} />
    <Tag id={props.router.query.id} />
    <Footer />
  </App>
));

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);

  return {
    loggedInUser,
  };
};

export default Page;
