"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useEffect } from "react"
import { themeChange } from "theme-change"

function ThemeToggle() {
  useEffect(() => {
    themeChange(false)
  }, [])

  return (
    <>
      <label
        className="swap swap-rotate"
        data-toggle-theme="dracula,nord"
        data-act-class="ACTIVECLASS"
      >
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" />

        {/* sun icon */}
        <SunIcon className="swap-off w-4 h-4" />

        {/* moon icon */}
        <MoonIcon className="swap-on w-4 h-4" />

        {/* background */}

      </label>
    </>
  )
}

export default ThemeToggle
