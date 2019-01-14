import App from "../components/App";
import AdminPostList from "../components/AdminPostList";
import Head from "next/head";
import React from "react";
import Error from "next/error";

export default class Admin extends React.Component {
  static async getInitialProps(context) {
    // Put session in props
    console.log(context.session);
    return {};
  }

  render() {
    if (
      !this.props.loggedInUser ||
      !this.props.loggedInUser.role ||
      this.props.loggedInUser.role !== "admin"
    ) {
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
