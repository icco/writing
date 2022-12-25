import { Loading, Logo } from "@icco/react-common"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Header(params) {
  const { pathname, query } = useRouter()

  const elements = {
    about: (
      <Link key="/about" href="/about" prefetch={false}>
        <a className="f6 link dib dim mr3 black mr4-ns">about</a>
      </Link>
    ),
    largelogo: (
      <header className="mv5 center mw6">
        <Link href="/">
          <a className="link dark-gray dim">
            <Logo
              size={200}
              className="center"
              style={{ stroke: "#333", textAlign: "center" }}
            />
            <h1 className="tc">Nat? Nat. Nat!</h1>
          </a>
        </Link>
      </header>
    ),
    smalllogo: (
      <Link href="/">
        <a className="link dark-gray dim">
          <Logo
            size={50}
            className="v-mid mh0-ns dib-ns center ph0 logo"
            style={{ stroke: "#333" }}
          />
        </a>
      </Link>
    ),
  }

  let nav = <>{elements.signin}</>

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
