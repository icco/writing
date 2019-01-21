import App from "../components/App";
import AdminPostList from "../components/AdminPostList";
import AdminDraftList from "../components/AdminDraftList";
import Header from "../components/Header";
import Head from "next/head";
import React from "react";
import Error from "next/error";

import { checkLoggedIn } from "../lib/auth";
import { initApollo } from "../lib/init-apollo";

export default class Admin extends React.Component {
  async componentDidMount() {
    const { loggedInUser } = await checkLoggedIn(initApollo());
    this.setState({ loggedInUser });
  }

  render() {
    if (
      !this.state ||
      !this.state.loggedInUser ||
      !this.state.loggedInUser.role ||
      this.state.loggedInUser.role !== "admin"
    ) {
      return <Error statusCode={403} />;
    }

    return (
      <App>
        <Head>
          <title>Nat? Nat. Nat! Admin</title>
        </Head>
        <Header noLogo={true} loggedInUser={this.state.loggedInUser} />
        <div className="ma3">
          <h1>Admin</h1>
          <h2>Drafts</h2>
          <AdminDraftList />

          <h2>Published</h2>
          <AdminPostList />
        </div>
      </App>
    );
  }
}
