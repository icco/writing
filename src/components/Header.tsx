import { ChartColumn, Info, Tag } from "lucide-react"
import { SiteHeader } from "@icco/react-common/SiteHeader"

export default function Header() {
  return (
    <SiteHeader
      links={[
        {
          name: "Stats",
          href: "/stats",
          icon: <ChartColumn className="h-5 w-5" />,
        },
        {
          name: "Tags",
          href: "/tags",
          icon: <Tag className="h-5 w-5" />,
        },
        {
          name: "About",
          href: "/about",
          prefetch: false,
          icon: <Info className="h-5 w-5" />,
        },
      ]}
    />
  )
}
