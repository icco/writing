import React from "react";
import Link from "next/link";
import Router from "next/router";
import { NextAuth } from "next-auth/client";

export default class extends React.Component {
  static async getInitialProps({ req }) {
    return {
      session: await NextAuth.init({ force: true, req: req })
    };
  }

  async componentDidMount() {
    // Get latest session data after rendering on client then redirect.
    // The ensures client state is always updated after signing in or out.
    const session = await NextAuth.init({ force: true });
    Router.push("/");
  }

  render() {
    // Provide a link for clients without JavaScript as a fallback.
    return <React.Fragment />;
  }
}
