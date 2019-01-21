import App from "../../components/App";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EditPost from "../../components/EditPost";
import { withRouter } from "next/router";
import Error from "next/error";
import Head from "next/head";

import { checkLoggedIn } from "../../lib/auth";
import { initApollo } from "../../lib/init-apollo";

class AdminPost extends React.Component {
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
          <title>Nat? Nat. Nat! Edit Post #{this.props.router.query.id}</title>
        </Head>
        <Header noLogo={true} loggedInUser={this.state.loggedInUser} />
        <EditPost id={this.props.router.query.id} />
      </App>
    );
  }
}

export default withRouter(AdminPost);
