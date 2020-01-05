import React from "react";
import Link from "next/link";
import { Logo, Loading } from "@icco/react-common";
import { useRouter } from "next/router";

import { useLoggedIn } from "../lib/auth";

export default function Header({ noLogo }) {
  const { pathname, query } = useRouter();
  const { loading, login, logout, loggedInUser, error } = useLoggedIn();

  if (error) {
    throw error;
  }

  const elements = {
    about:  (
    <Link key="/about" href="/about" prefetch={false}>
      <a className="f6 link dib dim mr3 black mr4-ns">about</a>
    </Link>
  ),
    signin: (
      <a
        className="f6 link dib dim mr3 black mr4-ns"
        onClick={() => login({ appState: { returnTo: { pathname, query } } })}
      >
        sign in
      </a>
    ),
    signout: (
        <a
          className="f6 link dib dim mr3 black mr4-ns"
          onClick={() =>
            logout({ appState: { returnTo: { pathname, query } } })
          }
        >
          Sign Out
        </a>
    ),
    largelogo: (
      <header className="mv5 center mw6">
        <Link href="/">
          <a className="link dark-gray dim">
            <Logo size={200} className="center" />
            <h1 className="tc">Nat? Nat. Nat!</h1>
          </a>
        </Link>
      </header>
    ),
    smalllogo: (
      <Link href="/">
        <a className="link dark-gray dim">
          <Logo size={50} className="v-mid mh0-ns dib-ns center ph0 logo" />
        </a>
      </Link>
    ),
  }

  let nav = (
    <>
      {elements.about}

      {elements.singin}
    </>
  );

  if (loading) {
    nav = (
      <>
      {elements.about}

      <div className="dib h1"><Loading key={0} /></div>;
      </>
    )
  }

  if (loggedInUser) {
    nav = (
      <>
        {elements.about}

        <Link key="/admin" href="/admin">
          <a className="f6 link dib dim mr3 black mr4-ns">
            {loggedInUser.role}
          </a>
        </Link>
      </>
    );
  }

  let prefix = <></>;
  let head = <>{elements.largelogo}</>
  if (noLogo) {
    head = <></>;
    prefix = <>{elements.smalllogo}</>
  }

  return (
    <div>
      <nav className="flex justify-between ttc">
        <div className="flex items-center pa3">{prefix}</div>
        <div className="flex-grow pa3 flex items-center">{nav}</div>
      </nav>
      {head}
    </div>
  );
}
