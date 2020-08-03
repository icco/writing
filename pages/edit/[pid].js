import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import { Loading } from "@icco/react-common";

import AdminLinkList from "../../components/AdminLinkList";
import App from "../../components/App";
import EditPost from "../../components/EditPost";
import Header from "../../components/Header";
import NotAuthorized from "../../components/NotAuthorized";

const Page = (params) => {
  const { isLoading, error, isAuthenticated, user } = useAuth0();
  const router = useRouter();

  console.log(params);
  const { pid } = params;

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || user.role !== "admin") {
    return <NotAuthorized />;
  }

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

export default Page;
