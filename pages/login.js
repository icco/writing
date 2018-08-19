import App from "../components/App";
import Auth from "../components/Auth";
import Head from "next/head";
import Header from "../components/Header";

export default () => (
  <App>
    <Head>
      <title>Nat? Nat. Nat! | Login</title>
    </Head>
    <Header />
    <Auth />
  </App>
);
