"use client"

import { Button } from "@/components/ui/button"
import { FileText, Keyboard, Monitor, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface FooterProps {
  onShowHelp: () => void
  onShowKeyboardShortcuts: () => void
  onToggleView: () => void
}

export function Footer({ onShowHelp, onShowKeyboardShortcuts, onToggleView }: FooterProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <footer className="border-t p-2 flex items-center justify-center">
        <div className="flex items-center gap-1 lg:gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleView} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
            <Monitor className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Toggle View</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onShowHelp} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
            <FileText className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Help</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowKeyboardShortcuts}
            className="text-xs h-6 lg:h-7 px-1 lg:px-2"
          >
            <Keyboard className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-6 lg:h-7 px-1 lg:px-2">
            <Sun className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Theme</span>
          </Button>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t p-2 flex items-center justify-center">
      <div className="flex items-center gap-1 lg:gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleView} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
          <Monitor className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Toggle View</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onShowHelp} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
          <FileText className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Help</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onShowKeyboardShortcuts} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
          <Keyboard className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-xs h-6 lg:h-7 px-1 lg:px-2">
          {theme === "dark" ? <Moon className="w-3 h-3 mr-1" /> : <Sun className="w-3 h-3 mr-1" />}
          <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
        </Button>
      </div>
    </footer>
  )
}
