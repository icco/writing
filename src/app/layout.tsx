import Logo from "@/components/Logo"
import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <nav className="flex justify-between ttc">
          <div className="flex items-center pa3">
            <Link href="/" className="link dark-gray dim">
              <Logo
                size={50}
                className="v-mid mh0-ns dib-ns center ph0 logo"
                style={{ stroke: "#333" }}
              />
            </Link>
          </div>
          <div className="flex-grow pa3 flex items-center">
            <Link
              key="/about"
              href="/about"
              prefetch={false}
              className="f6 link dib dim mr3 black mr4-ns"
            >
              about
            </Link>
          </div>
        </nav>
        <main>{children}</main>
        <footer></footer>
      </body>
    </html>
  )
}
