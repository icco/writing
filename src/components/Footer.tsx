import { CodeBracketIcon, DocumentCheckIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import Link from "next/link"
import { RecurseLogo } from "./RecurseLogo"

const Footer = () => {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="divider" />
      <footer className="footer items-center p-4">
        <aside className="grid-flow-col items-center">
          <p>
            &copy; 2011 - {format(new Date(), "yyyy")} Nat Welch. All rights
            reserved.
          </p>
        </aside>
        <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <Link
            href="https://www.recurse.com/scout/click?t=1a20cf01214e4c5923ab6ebd6c0f8f18"
            title="Want to become a better programmer? Join the Recurse Center!"
          >
            <RecurseLogo className="inline-block h-4 w-4" />
          </Link>
          <Link
            className="blue ms-2"
            href="https://github.com/icco/writing"
            title="Source Code"
          >
            <CodeBracketIcon className="inline-block h-4 w-4" />
          </Link>
          <Link
            className="blue ms-2"
            href="https://natwelch.com/privacy"
            title="Privacy Policy"
          >
            <DocumentCheckIcon className="inline-block h-4 w-4" />
          </Link>
        </nav>
      </footer>
    </div>
  )
}

export default Footer
