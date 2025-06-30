"use client"

import { useState, useRef } from "react"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/docker-compose/Header"
import { EditorSection } from "@/components/docker-compose/EditorPanel"
import { ConfigurationPanel } from "@/components/docker-compose/ConfigurationPanel"
import { Footer } from "@/components/docker-compose/Footer"
import { HelpDialog } from "@/components/docker-compose/HelpDialog"
import { KeyboardShortcutsDialog } from "@/components/docker-compose/KeyboardShortcutsDialog"
import { useSuppressResizeObserverError } from "@/hooks/use-suppress-resize-observer-error"

const defaultCompose = `version: '3.9'

services:
  composetoolbox:
    image: ghcr.io/bluegoosemedia/composetoolbox:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped`

export default function DockerComposePage() {
  // Silences noisy (but harmless) ResizeObserver warnings from Monaco
  useSuppressResizeObserverError()
  const [compose, setCompose] = useState(defaultCompose)
  const [view, setView] = useState<"split" | "editor" | "configuration">("split")
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const editorRef = useRef<{ goToLine: (line: number) => void }>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(compose)
  }

  const downloadCompose = () => {
    const blob = new Blob([compose], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "docker-compose.yml"
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleView = () => {
    setView((current) => {
      if (current === "split") return "editor"
      if (current === "editor") return "configuration"
      return "split"
    })
  }

  const handleGoToLine = (line: number) => {
    if (editorRef.current) {
      editorRef.current.goToLine(line)
    }
    // Switch to editor view if not already visible
    if (view === "configuration") {
      setView("split")
    }
  }

  return (
    <>
      <Header
        view={view}
        setView={setView}
        syntaxHighlighting={syntaxHighlighting}
        setSyntaxHighlighting={setSyntaxHighlighting}
        onShowHelp={() => setShowHelp(true)}
        onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        onCopy={copyToClipboard}
        onDownload={downloadCompose}
        compose={compose}
      />

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <EditorSection
          ref={editorRef}
          compose={compose}
          onChange={setCompose}
          syntaxHighlighting={syntaxHighlighting}
          view={view}
        />

        {/* Separator - only show on desktop split view */}
        {view === "split" && <Separator orientation="vertical" className="h-full hidden lg:block" />}

        {(view === "configuration" || view === "split") && (
          <ConfigurationPanel compose={compose} view={view} onGoToLine={handleGoToLine} />
        )}
      </div>

      <Footer
        onShowHelp={() => setShowHelp(true)}
        onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        onToggleView={toggleView}
      />

      <HelpDialog show={showHelp} onClose={() => setShowHelp(false)} />
      <KeyboardShortcutsDialog show={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </>
  )
}
