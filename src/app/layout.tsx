import "./globals.css"

import type { Metadata } from "next"
import { Roboto, Roboto_Slab } from "next/font/google"
import Link from "next/link"

import Logo from "@/components/Logo"

const font = Roboto({
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Nat? Nat. Nat!",
  description: "The personal blog of Nat Welch",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <nav className="flex py-8">
          <div className="flex-none">
            <Link href="/" className="">
              <Logo
                size={50}
                className="px-8 logo"
                style={{ stroke: "#333" }}
              />
            </Link>
          </div>
          <div className="flex-grow"></div>
          <div className="flex-none">
            <Link key="/about" href="/about" prefetch={false} className="m-8">
              About
            </Link>
          </div>
        </nav>
        <main>{children}</main>
        <footer></footer>
      </body>
    </html>
  )
}
