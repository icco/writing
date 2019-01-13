import App from "../components/App";
import AdminPostList from "../components/AdminPostList";
import Head from "next/head";
import React from "react";
import Error from "next/error";
import checkLoggedIn from '../lib/checkLoggedIn'

export default class Admin extends React.Component {
  static async getInitialProps(context) {
    // Put session in props
    return { loggedInUser } = await checkLoggedIn(context.apolloClient)
  }

  render() {
    if (!this.props.loggedInUser || !this.props.loggedInUser.role || this.props.loggedInUser.role !== "admin") {
      return <Error statusCode={403} />;
    }

    return (
      <App>
        <Head>
          <title>Nat? Nat. Nat! Admin</title>
        </Head>
        <AdminPostList />
      </App>
    );
  }
}
