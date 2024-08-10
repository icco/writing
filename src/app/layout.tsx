import "./globals.css"

import type { Metadata, Viewport } from "next"
import { Roboto, Roboto_Mono, Roboto_Slab } from "next/font/google"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { ThemeProvider } from "@/components/ThemeProvider"

const roboto = Roboto({
  weight: "400",
  variable: "--font-roboto",
  subsets: ["latin"],
})

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nat? Nat. Nat!",
  description: "The personal blog of Nat Welch",
}

export const viewport: Viewport = {
  viewportFit: "cover",
  initialScale: 1.0,
  width: "device-width",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let meticulousScript = <></>
  if (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    meticulousScript = (
      // eslint-disable-next-line @next/next/no-sync-scripts
      <script
        data-project-id="HRQOYGM9Ui3pdObThsWrs6RCZ38sO96OXPNAeMSu"
        data-is-production-environment="false"
        src="https://snippet.meticulous.ai/v1/meticulous.js"
      />
    )
  }
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoSlab.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <head>{meticulousScript}</head>
      <body>
        <ThemeProvider defaultTheme="system" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
