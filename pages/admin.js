import App from "../components/App";
import Header from "../components/Header";
import Head from "next/head";

export default props => {
  console.log(props);

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! | Admin</title>
      </Head>
      <Header />
    </App>
  );
};
