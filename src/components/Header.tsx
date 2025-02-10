import Link from "next/link"

import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"

export default function Header() {
  return (
    <nav className="flex py-8">
      <div className="flex-none">
        <Link href="/" className="">
          <Logo size={50} className="logo stroke-current px-8" />
        </Link>
      </div>
      <div className="grow"></div>
      <div className="flex-none">
        <ThemeToggle />

        <Link key="/tags" href="/tags" className="mr-4 ml-8">
          Tags
        </Link>

        <Link key="/about" href="/about" prefetch={false} className="mx-4">
          About
        </Link>
      </div>
    </nav>
  )
}
