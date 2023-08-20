import "./globals.css"

import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import Link from "next/link"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
