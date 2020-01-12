import Head from "next/head";
import Link from "next/link";
import { withAuth, withLoginRequired } from "use-auth0-hooks";
import { withApollo, useLoggedIn } from "@icco/react-common";

import AdminPostList from "../components/AdminPostList";
import App from "../components/App";
import Header from "../components/Header";
import NotAuthorized from "../components/NotAuthorized";

const Page = ({ auth }) => {
  const { loggedInUser } = useLoggedIn();
  if (!loggedInUser || loggedInUser.role !== "admin") {
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
            <Link as={"/admin/new"} href={"/admin/new"}>
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

export default withLoginRequired(withAuth(withApollo(Page)));
