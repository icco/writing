import { Logo } from "@icco/react-common"
import Link from "next/link"

export default function Header(params) {
  const elements = {
    about: (
      <Link
        key="/about"
        href="/about"
        prefetch={false}
        className="f6 link dib dim mr3 black mr4-ns">
        about
      </Link>
    ),
    largelogo: (
      <header className="mv5 center mw6">
        <Link href="/" className="link dark-gray dim">

          <Logo
            size={200}
            className="center"
            style={{ stroke: "#333", textAlign: "center" }}
          />
          <h1 className="tc">Nat? Nat. Nat!</h1>

        </Link>
      </header>
    ),
    smalllogo: (
      (<Link href="/" className="link dark-gray dim">

        <Logo
          size={50}
          className="v-mid mh0-ns dib-ns center ph0 logo"
          style={{ stroke: "#333" }}
        />

      </Link>)
    ),
  }

  const nav = <></>

  return (
    <>
      <nav className="flex justify-between ttc">
        <div className="flex items-center pa3">
          {params.noLogo ? elements.smalllogo : ""}
        </div>
        <div className="flex-grow pa3 flex items-center">
          {elements.about}
          {nav}
        </div>
      </nav>
      {params.noLogo ? "" : elements.largelogo}
    </>
  )
}
