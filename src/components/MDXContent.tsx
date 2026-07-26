/* eslint-disable react-hooks/static-components */
import { type MDXComponents } from "mdx/types"
import Link from "next/link"
import { useMDXComponent } from "next-contentlayer2/hooks"

import MusicEmbed from "./MusicEmbed"
import PhotoGrid from "./PhotoGrid"

export const components: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  MusicEmbed,
  PhotoGrid,
}

export function MDXContent({ code }: { code: string }) {
  const Content = useMDXComponent(code)

  return <Content components={components} />
}
