import React from "react";
import Router from "next/router";

import { checkLoggedIn } from "../lib/auth";
import { initApollo } from "../lib/init-apollo";

export default class extends React.Component {
  async componentDidMount() {
    const { loggedInUser } = await checkLoggedIn(initApollo());
    this.setState({ loggedInUser });
  }

  static async getInitialProps({ res }) {
    if (res) {
      res.writeHead(302, {
        Location: "http://example.com",
      });
      res.end();
    } else {
      Router.push("http://example.com");
    }
    return {};
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

    return (<></>)
  }
}
