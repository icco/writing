import Link from "next/link"

import Logo from "@icco/react-common/Logo"
import ThemeToggle from "@icco/react-common/ThemeToggle"

export default function Header() {
  return (
    <nav aria-label="Site navigation" className="flex py-8">
      <div className="flex-none">
        <Link href="/" aria-label="Home">
          <Logo size={50} className="logo stroke-current px-8" aria-hidden="true" />
        </Link>
      </div>
      <div className="grow"></div>
      <div className="flex-none">
        <ThemeToggle />

        <Link key="/stats" href="/stats" className="mr-4 ml-8">
          Stats
        </Link>

        <Link key="/tags" href="/tags" className="mx-4">
          Tags
        </Link>

        <Link key="/about" href="/about" prefetch={false} className="mx-4">
          About
        </Link>
      </div>
    </nav>
  )
}
