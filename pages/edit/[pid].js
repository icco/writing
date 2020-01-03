import Head from "next/head";
import { useRouter } from "next/router";

import AdminLinkList from "../../components/AdminLinkList";
import App from "../../components/App";
import EditPost from "../../components/EditPost";
import Header from "../../components/Header";
import NotAuthorized from "../../components/NotAuthorized";
import { checkLoggedIn } from "../../lib/auth";
import { withApollo } from "../../lib/apollo";

const Page = props => {
  if (
    !props.loggedInUser ||
    !props.loggedInUser.role ||
    props.loggedInUser.role !== "admin"
  ) {
    return <NotAuthorized />;
  }

  const router = useRouter();
  if (router == null) {
    return <></>;
  }
  const { pid } = router.query;

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Edit Post #{pid}</title>
      </Head>
      <Header noLogo loggedInUser={props.loggedInUser} />
      <EditPost id={pid} loggedInUser={props.loggedInUser} />
      <AdminLinkList />
    </App>
  );
};

Page.getInitialProps = async ctx => {
  const { loggedInUser } = await checkLoggedIn(ctx.apolloClient);
  let ret = { loggedInUser };
  return ret;
};

export default withApollo(Page);
