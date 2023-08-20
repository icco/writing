import Link from "next/link"

import Logo from "@/components/Logo"

export default function Header() {
  return (
    <nav className="flex py-8">
      <div className="flex-none">
        <Link href="/" className="">
          <Logo size={50} className="px-8 logo" style={{ stroke: "#333" }} />
        </Link>
      </div>
      <div className="flex-grow"></div>
      <div className="flex-none">
        <Link key="/about" href="/about" prefetch={false} className="m-8">
          About
        </Link>
      </div>
    </nav>
  )
}
