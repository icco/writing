import { useRouter } from "next/router";
import { useState } from "react";

import App from "../components/App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Search from "../components/Search";
import { withApollo } from "../lib/apollo";

const Page = props => {
  const router = useRouter();
  const [value, setValue] = useState("");
  if (router == null) {
    return <></>;
  }

  const { query } = router.query;
  let results = <></>;

  if (query && query != value) {
    setValue(query);
  }

  if (value != "") {
    results = <Search query={value} />;
  }

  return (
    <App>
      <Header noLogo />
      <form className="">
        <fieldset className="cf bn ma3 pa3">
          <div class="cf">
            <input
              type="text"
              class="f6 f5-l input-reset bn fl black-80 bg-white pa3 lh-solid w-90 br2-ns br--left-ns"
              placeholder="Search"
              name="query"
              value={value}
              id="query"
              onChange={e => setValue(e.target.value)}
            />
            <input
              type="submit"
              class="f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-black white pointer w-10 br2-ns br--right-ns"
              value="&#8618;"
            />
          </div>
        </fieldset>
      </form>

      {results}
      <Footer />
    </App>
  );
};

export default withApollo(Page);
