"use client"

import { MoonIcon } from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light")
      }}
    >
      <MoonIcon />
    </button>
  )
}

export default ThemeToggle
