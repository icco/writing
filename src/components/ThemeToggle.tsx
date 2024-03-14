"use client"

import { MoonIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light")
      }}
    >
      <MoonIcon className="inline-block w-4 h-4" />
    </button>
  )
}

export default ThemeToggle
