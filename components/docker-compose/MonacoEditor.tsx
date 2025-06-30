"use client"

import React, { useRef, useCallback, useEffect, useState } from "react"
import Editor, { type OnMount, loader } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { useTheme } from "next-themes"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  syntaxHighlighting: boolean
}

// Configure Monaco to prevent worker loading issues
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
})

export const MonacoEditor = React.forwardRef<
  { insertText: (text: string) => void; focus: () => void; goToLine: (line: number) => void },
  MonacoEditorProps
>(({ value, onChange, className, placeholder, syntaxHighlighting }, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted before using theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor

      // Define custom dark theme that matches our design system
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "d4d4d4" }, // Default text color
          { token: "comment", foreground: "6a9955" }, // Comments
          { token: "keyword", foreground: "569cd6" }, // Keywords
          { token: "string", foreground: "ce9178" }, // Strings
          { token: "number", foreground: "b5cea8" }, // Numbers
        ],
        colors: {
          "editor.background": "#171717", // Matches our --card color (darker)
          "editor.foreground": "#d4d4d4",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
          "editor.selectionBackground": "#264f78",
          "editor.selectionHighlightBackground": "#add6ff26",
          "editor.wordHighlightBackground": "#575757b8",
          "editor.wordHighlightStrongBackground": "#004972b8",
          "editorCursor.foreground": "#aeafad",
          "editor.lineHighlightBackground": "#2a2a2a", // Slightly lighter than background
          "editorWhitespace.foreground": "#404040",
          "editorIndentGuide.background": "#404040",
          "editorIndentGuide.activeBackground": "#707070",
          "editor.findMatchBackground": "#515c6a",
          "editor.findMatchHighlightBackground": "#ea5c0055",
          "editor.findRangeHighlightBackground": "#3a3d4166",
          "editorHoverWidget.background": "#252526",
          "editorHoverWidget.border": "#454545",
          "editorSuggestWidget.background": "#252526",
          "editorSuggestWidget.border": "#454545",
          "scrollbarSlider.background": "#79797966",
          "scrollbarSlider.hoverBackground": "#646464b3",
          "scrollbarSlider.activeBackground": "#bfbfbf66",
        },
      })

      // Define custom light theme with better visual hierarchy and distinct editor background
      monaco.editor.defineTheme("custom-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "", foreground: "1f2937" }, // Default text - gray-800
          { token: "comment", foreground: "6b7280" }, // Comments - gray-500
          { token: "keyword", foreground: "3b82f6" }, // Keywords - blue-500
          { token: "string", foreground: "059669" }, // Strings - emerald-600
          { token: "number", foreground: "dc2626" }, // Numbers - red-600
          { token: "type", foreground: "7c3aed" }, // Types - violet-600
          { token: "variable", foreground: "1f2937" }, // Variables - gray-800
        ],
        colors: {
          "editor.background": "#ffffff", // Pure white editor background to stand out
          "editor.foreground": "#1f2937", // gray-800
          "editorLineNumber.foreground": "#9ca3af", // gray-400
          "editorLineNumber.activeForeground": "#4b5563", // gray-600
          "editor.selectionBackground": "#dbeafe", // blue-100
          "editor.selectionHighlightBackground": "#eff6ff", // blue-50
          "editor.wordHighlightBackground": "#f3f4f6", // gray-100
          "editor.wordHighlightStrongBackground": "#e5e7eb", // gray-200
          "editorCursor.foreground": "#374151", // gray-700
          "editor.lineHighlightBackground": "#f8fafc", // slate-50 - very subtle highlight
          "editorWhitespace.foreground": "#d1d5db", // gray-300
          "editorIndentGuide.background": "#e5e7eb", // gray-200
          "editorIndentGuide.activeBackground": "#9ca3af", // gray-400
          "editor.findMatchBackground": "#fbbf24", // amber-400
          "editor.findMatchHighlightBackground": "#fef3c7", // amber-100
          "editor.findRangeHighlightBackground": "#f3f4f6", // gray-100
          "editorHoverWidget.background": "#ffffff", // white
          "editorHoverWidget.border": "#d1d5db", // gray-300
          "editorSuggestWidget.background": "#ffffff", // white
          "editorSuggestWidget.border": "#d1d5db", // gray-300
          "scrollbarSlider.background": "#cbd5e1", // slate-300
          "scrollbarSlider.hoverBackground": "#94a3b8", // slate-400
          "scrollbarSlider.activeBackground": "#64748b", // slate-500
        },
      })

      // Basic YAML language configuration only
      monaco.languages.setLanguageConfiguration("yaml", {
        brackets: [
          ["{", "}"],
          ["[", "]"],
          ["(", ")"],
        ],
        autoClosingPairs: [
          { open: "{", close: "}" },
          { open: "[", close: "]" },
          { open: "(", close: ")" },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        indentationRules: {
          increaseIndentPattern: /^.*:(\s*$|\s+.*$)/,
          decreaseIndentPattern: /^\s*-\s*$/,
        },
      })

      // Focus the editor
      editor.focus()

      // Apply initial theme after a short delay to ensure resolvedTheme is available
      setTimeout(() => {
        if (editorRef.current && mounted) {
          const isDark = resolvedTheme === "dark"
          const monacoTheme = isDark ? "custom-dark" : "custom-light"
          editorRef.current.updateOptions({ theme: monacoTheme })
        }
      }, 100)
    },
    [mounted, resolvedTheme],
  )

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value || "")
    },
    [onChange],
  )

  // Update Monaco theme when theme changes - with better detection
  useEffect(() => {
    if (editorRef.current && mounted && resolvedTheme) {
      const isDark = resolvedTheme === "dark"
      const monacoTheme = isDark ? "custom-dark" : "custom-light"
      editorRef.current.updateOptions({ theme: monacoTheme })
    }
  }, [resolvedTheme, mounted])

  React.useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (editorRef.current) {
        const editor = editorRef.current
        const selection = editor.getSelection()
        const range = selection || {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        }

        editor.executeEdits("insert-text", [
          {
            range,
            text,
            forceMoveMarkers: true,
          },
        ])

        editor.focus()
      }
    },
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    },
    goToLine: (line: number) => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(line)
        editorRef.current.setPosition({ lineNumber: line, column: 1 })
        editorRef.current.focus()
      }
    },
  }))

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={className}>
        <div className="w-full h-full border rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    )
  }

  // Use resolvedTheme directly - this is the actual computed theme
  const isDark = resolvedTheme === "dark"
  const monacoTheme = isDark ? "custom-dark" : "custom-light"

  return (
    <div className={className}>
      <div className="w-full h-full border rounded-lg overflow-hidden">
        <Editor
          height="100%"
          language={syntaxHighlighting ? "yaml" : "plaintext"}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={monacoTheme}
          options={{
            // Editor behavior
            automaticLayout: true,
            wordWrap: "on",
            lineNumbers: syntaxHighlighting ? "on" : "off",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,

            // Indentation
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,

            // Features
            folding: false,
            bracketPairColorization: { enabled: false },
            guides: {
              indentation: false,
              highlightActiveIndentation: false,
            },

            // Scrollbar - minimal styling
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14,
              useShadows: false,
            },

            // Accessibility
            accessibilitySupport: "auto",

            // Performance
            renderWhitespace: "none",
            renderControlCharacters: false,

            // Disable all advanced features
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            parameterHints: { enabled: false },
            hover: { enabled: false },
            contextmenu: false,
            links: false,
            colorDecorators: false,
            lightbulb: { enabled: false },
            codeActionsOnSave: {},
            codeLens: false,

            // Font and appearance
            fontSize: 14,
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            lineHeight: 1.5,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading editor...</div>
          }
        />
      </div>

      {/* Custom placeholder overlay when editor is empty */}
      {placeholder && !value && (
        <div className="absolute top-0 left-0 p-3 pointer-events-none text-muted-foreground font-mono text-sm">
          {placeholder}
        </div>
      )}
    </div>
  )
})

MonacoEditor.displayName = "MonacoEditor"
