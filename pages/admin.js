import React from "react";
import Head from "next/head";
import Link from "next/link";
import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { ErrorMessage, Loading } from "@icco/react-common";

import AdminPostList from "../components/AdminPostList";
import App from "../components/App";
import Header from "../components/Header";
import NotAuthorized from "../components/NotAuthorized";
import { getUser } from "../components/User";

const Page = (params) => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const [
    user,
    { loading: queryLoading, error: queryError, data: userData },
  ] = useLazyQuery(getUser);

  if (isLoading || queryLoading) {
    return <Loading />;
  }

  if (error || queryError) {
    return <ErrorMessage error={error} message="Unable to get page." />;
  }

  if (!isAuthenticated) {
    return <NotAuthorized />;
  }

  if (!userData) {
    user();
    return <Loading />;
  }

  if (userData.whoami == null) {
    return <NotAuthorized />;
  }

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Admin</title>
      </Head>
      <Header noLogo />
      <div className="ma3">
        <h1>Admin</h1>
        <ul className="list pl0" key="new-ul">
          <li className="" key={"new-post"}>
            <Link href={"/admin/new"}>
              <a className="link dark-gray dim">New Post</a>
            </Link>
          </li>
        </ul>

        <h2>Drafts</h2>
        <AdminPostList type="drafts" />

        <h2>Future</h2>
        <AdminPostList type="future" />

        <h2>Published</h2>
        <AdminPostList type="published" />
      </div>
    </App>
  );
};

export default withAuthenticationRequired(Page);
