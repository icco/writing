import { SiteHeader } from "@icco/react-common/SiteHeader"

export default function Header() {
  return (
    <SiteHeader
      links={[
        { name: "Stats", href: "/stats" },
        { name: "Tags", href: "/tags" },
        { name: "About", href: "/about", prefetch: false },
      ]}
    />
  )
}
