import Link from "next/link";
import { Logo } from "@icco/react-common";
import { useAuth } from 'use-auth0-hooks';

export default function Header ({ noLogo }) => {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  !isLoading && 
            isAuthenticated

  let prefix = <></>;
  let about = (
    <Link key="/about" href="/about" prefetch={false}>
      <a className="f6 link dib dim mr3 black mr4-ns">about</a>
    </Link>
  );

  let nav = (
    <>
      {about}

      <Link key="/auth/sign-in" href="/auth/sign-in">
        <a className="f6 link dib dim mr3 black mr4-ns">sign in</a>
      </Link>
    </>
  );
  let head = (
    <>
      <header className="mv5 center mw6">
        <Link href="/">
          <a className="link dark-gray dim">
            <Logo size={200} className="center" />
            <h1 className="tc">Nat? Nat. Nat!</h1>
          </a>
        </Link>
      </header>
    </>
  );

  if (loggedInUser) {
    nav = (
      <>
        {about}

        <Link key="/admin" href="/admin">
          <a className="f6 link dib dim mr3 black mr4-ns">
            {loggedInUser.role}
          </a>
        </Link>

        <Link key="/auth/sign-out" href="/auth/sign-out">
          <a className="f6 link dib dim mr3 black mr4-ns">Sign Out</a>
        </Link>
      </>
    );
  }

  if (noLogo) {
    head = <></>;
    prefix = (
      <Link href="/">
        <a className="link dark-gray dim">
          <Logo size={50} className="v-mid mh0-ns dib-ns center ph0 logo" />
        </a>
      </Link>
    );
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
};
