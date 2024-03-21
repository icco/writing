import { type MDXComponents } from "mdx/types"
import Link from "next/link"
import { useMDXComponent } from "next-contentlayer-temp/hooks"

export const components: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
}

export function MDXContent({ code }: { code: string }) {
  const Content = useMDXComponent(code)

  return <Content components={components} />
}
