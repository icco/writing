import App from "../components/App";
import AdminPostList from "../components/AdminPostList";
import Head from "next/head";
import React from "react";
import Error from "next/error";

export default class Page extends React.Component {
  static async getInitialProps() {
    // Put session in props
    return {};
  }

  render() {
    if (!this.props.session || !this.props.session.user || this.props.session.user.admin !== true) {
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
