import { type MDXComponents } from "mdx/types"
import { useMDXComponent } from "next-contentlayer/hooks"
import Link from "next/link"

export const components: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
}

export function MDXContent({ code }: { code: string }) {
  const Content = useMDXComponent(code)

  return <Content components={components} />
}
