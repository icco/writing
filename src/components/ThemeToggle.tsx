"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <label
        className="swap swap-rotate"
        onClick={() => {
          setTheme(theme === "light" ? "dark" : "light")
        }}
      >
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" />

        {/* sun icon */}
        <SunIcon className="swap-off w-4 h-4" />

        {/* moon icon */}
        <MoonIcon className="swap-on w-4 h-4" />
      </label>
    </>
  )
}

export default ThemeToggle
