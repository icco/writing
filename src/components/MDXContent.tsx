import { type MDXComponents } from "mdx/types"
import { useMDXComponent } from "next-contentlayer/hooks"

export const components: MDXComponents = {}

export function MDXContent({ code }: { code: string }) {
  const Content = useMDXComponent(code)

  return <Content components={components} />
}
