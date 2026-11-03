/* eslint-disable react-hooks/static-components */
import { runSync } from "@mdx-js/mdx"
import { type MDXComponents } from "mdx/types"
import Link from "next/link"
import * as runtime from "react/jsx-runtime"

import MusicEmbed from "./MusicEmbed"
import PhotoGrid from "./PhotoGrid"

export const components: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  MusicEmbed,
  PhotoGrid,
}

export function MDXContent({ code }: { code: string }) {
  const { default: Content } = runSync(code, runtime)

  return <Content components={components} />
}
