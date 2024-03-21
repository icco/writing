"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const onClick = () => {
    console.log("clicked", { theme })
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <>
      <label className="swap swap-rotate">
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" />

        {/* sun icon */}
        <SunIcon className="swap-off w-4 h-4" onClick={onClick} />

        {/* moon icon */}
        <MoonIcon className="swap-on w-4 h-4" onClick={onClick} />
      </label>
    </>
  )
}

export default ThemeToggle
