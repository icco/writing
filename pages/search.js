import { useRouter } from "next/router";

import App from "../components/App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Search from "../components/Search";
import { withApollo } from "../lib/apollo";

const Page = props => {
  const router = useRouter();
  if (router == null) {
    return <></>;
  }
  return (
    <App>
      <Header noLogo />
      <form class="">
        <fieldset class="cf bn ma0 pa0">
          <div class="cf">
            <input
              class="f6 f5-l input-reset bn fl black-80 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns"
              placeholder="Search"
              type="text"
              name="search"
              value=""
              id="search"
            />
            <input
              class="f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-black white pointer w-100 w-25-m w-20-l br2-ns br--right-ns"
              type="submit"
              value="Search"
            />
          </div>
        </fieldset>
      </form>
      <Search query={router.query} />
      <Footer />
    </App>
  );
};

export default withApollo(Page);
