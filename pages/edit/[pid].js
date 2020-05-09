import Head from "next/head";
import { useRouter } from "next/router";
import { withAuth, withLoginRequired } from "use-auth0-hooks";

import AdminLinkList from "../../components/AdminLinkList";
import App from "../../components/App";
import EditPost from "../../components/EditPost";
import Header from "../../components/Header";
import NotAuthorized from "../../components/NotAuthorized";

import { withApollo } from "../../lib/apollo";
import { useLoggedIn } from "../../lib/auth";

const Page = () => {
  const router = useRouter();
  const { loggedInUser } = useLoggedIn();
  if (!loggedInUser || loggedInUser.role !== "admin") {
    return <NotAuthorized />;
  }

  if (router == null) {
    return <></>;
  }
  const { pid } = router.query;

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Edit Post #{pid}</title>
      </Head>
      <Header noLogo />
      <EditPost id={pid} />
      <AdminLinkList />
    </App>
  );
};

export default withLoginRequired(withAuth(withApollo(Page)));
