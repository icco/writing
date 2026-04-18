import { CodeBracketIcon, DocumentCheckIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import Link from "next/link"

import { RecurseLogo } from "@icco/react-common/RecurseLogo"
import { RecurseRing } from "@icco/react-common/RecurseRing"
import { Social } from "@icco/react-common/Social"
import { XXIIVVLogo } from "@icco/react-common/XXIIVVLogo"
import { XXIIVVRing } from "@icco/react-common/XXIIVVRing"

const Footer = () => {
  return (
    <footer className="mx-auto max-w-5xl pt-[14vh] pb-[8vh]">
      <div className="divider" />
      <div className="footer sm:footer-horizontal items-center p-4">
        <aside className="grid-flow-col items-center">
          <p>
            &copy; 2011 - {format(new Date(), "yyyy")} Nat Welch. All rights
            reserved.
          </p>
        </aside>
        <nav aria-label="Footer links" className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <Link
            href="https://www.recurse.com/scout/click?t=1a20cf01214e4c5923ab6ebd6c0f8f18"
            title="Want to become a better programmer? Join the Recurse Center!"
            aria-label="Want to become a better programmer? Join the Recurse Center!"
          >
            <RecurseLogo className="inline-block h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="blue ms-2"
            href="https://github.com/icco/writing"
            title="Source Code"
            aria-label="Source code on GitHub"
          >
            <CodeBracketIcon className="inline-block h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="blue ms-2"
            href="https://natwelch.com/privacy"
            title="Privacy Policy"
            aria-label="Privacy Policy"
          >
            <DocumentCheckIcon className="inline-block h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>

      <div className="footer sm:footer-horizontal text-base-content p-4">
        <nav aria-label="Social links" className="gap-4">
          <h6 className="footer-title">Social</h6>
          <Social includeWebring={false} size={24} />
        </nav>
        <nav aria-label="Recurse Center webring" className="gap-4 md:justify-self-end">
          <h6 className="footer-title">
            <Link href="https://ring.recurse.com/" className="hover:underline">
              <RecurseLogo
                aria-hidden="true"
                className="inline-block h-4 w-4 align-text-bottom"
                size={12}
              />{" "}
              Recurse Center Webring
            </Link>
          </h6>
          <RecurseRing />
        </nav>
        <nav aria-label="XXIIVV webring" className="gap-4 md:justify-self-end">
          <h6 className="footer-title">
            <Link
              href="https://webring.xxiivv.com/"
              className="hover:underline"
            >
              <XXIIVVLogo
                aria-hidden="true"
                className="inline-block h-4 w-4 align-text-bottom"
                size={12}
              />{" "}
              XXIIVV Webring
            </Link>
          </h6>
          <XXIIVVRing />
        </nav>
      </div>
    </footer>
  )
}

export default Footer
