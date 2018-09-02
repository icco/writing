import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";
import { Component } from "react";
import { NextAuth } from "next-auth/client";

export default class extends Component {
  static async getInitialProps(ctx) {
    const sessData = await NextAuth.init({ req: ctx.req });
    return {
      session: sessData
    };
  }

  render(props) {
    console.log(props);

    return (
      <App>
        <Head>
          <title>Nat? Nat. Nat! | Admin</title>
        </Head>
        <Header />

        <Footer />
      </App>
    );
  }
}
