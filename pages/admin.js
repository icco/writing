import Head from "next/head";
import Link from "next/link";
import { withAuth, withLoginRequired } from "use-auth0-hooks";

import AdminPostList from "../components/AdminPostList";
import App from "../components/App";
import Header from "../components/Header";
import NotAuthorized from "../components/NotAuthorized";
import { withApollo } from "../lib/apollo";

const Page = ({ auth }) => {
  // if (loggedInUser.role !== "admin") {
  //   return <NotAuthorized />;
  // }
  console.log(auth);

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Admin</title>
      </Head>
      <Header noLogo loggedInUser={loggedInUser} />
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
