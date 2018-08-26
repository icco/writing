import App from "../components/App";
import securePage from "../lib/securePage";
import Footer from "../components/Footer";
import { withRouter } from "next/router";

const Secret = withRouter(({ loggedUser }) => (
  <App>
    <div>
      Hi <strong>{loggedUser.email}</strong>. This is a super secure page! Try
      loading this page again using the incognito/private mode of your browser.
    </div>

    <Footer />
  </App>
));

export default securePage(Secret);
