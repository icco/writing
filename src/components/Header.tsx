import {
  ChartBarIcon,
  InformationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { SiteHeader } from "@icco/react-common/SiteHeader"

export default function Header() {
  return (
    <SiteHeader
      links={[
        {
          name: "Stats",
          href: "/stats",
          icon: <ChartBarIcon className="h-5 w-5" />,
        },
        {
          name: "Tags",
          href: "/tags",
          icon: <TagIcon className="h-5 w-5" />,
        },
        {
          name: "About",
          href: "/about",
          prefetch: false,
          icon: <InformationCircleIcon className="h-5 w-5" />,
        },
      ]}
    />
  )
}
