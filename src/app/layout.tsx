import "./globals.css"

import type { Metadata } from "next"
import { Archivo } from "next/font/google"

import Footer from "@/components/Footer"
import Header from "@/components/Header"

const font = Archivo({
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
