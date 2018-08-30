import NoSSR from "react-no-ssr";
import Cookie from "js-cookie";
import NotAuthorized from "../components/NotAuthorized";
import App from "../components/App";
import securePage from "../lib/securePage";
import Footer from "../components/Footer";
import { withRouter } from "next/router";

const Secret = withRouter(props => {
  console.log(Cookie.get());

  if (!props.isAuthenticated) {
    return (
      <NoSSR>
        <NotAuthorized />
      </NoSSR>
    );
  }

  return (
    <App>
      <div>
        Hi <strong>{loggedUser.email}</strong>. This is a super secure page! Try
        loading this page again using the incognito/private mode of your
        browser.
      </div>

      <Footer />
    </App>
  );
});

export default Secret;
