"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"

function ThemeToggle() {
  return (
    <>
      <label className="swap swap-rotate">
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" className="theme-controller" value="nord" />

        {/* sun icon */}
        <SunIcon className="swap-off w-4 h-4" />

        {/* moon icon */}
        <MoonIcon className="swap-on w-4 h-4" />
      </label>
    </>
  )
}

export default ThemeToggle
