"use client"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Code, Container, Keyboard, Download, Copy, ChevronDown, Sparkles, Monitor } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  view: "split" | "editor" | "configuration"
  setView: (view: "split" | "editor" | "configuration") => void
  syntaxHighlighting: boolean
  setSyntaxHighlighting: (enabled: boolean) => void
  onShowHelp: () => void
  onShowKeyboardShortcuts: () => void
  onCopy: () => void
  onDownload: () => void
  compose: string
}

export function Header({
  view,
  setView,
  syntaxHighlighting,
  setSyntaxHighlighting,
  onShowHelp,
  onShowKeyboardShortcuts,
  onCopy,
  onDownload,
  compose,
}: HeaderProps) {
  return (
    <div className="border-b">
      <div className="px-3 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo Menu */}
          <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 h-auto">
                  <div className="p-1.5 lg:p-2 bg-blue-600 rounded-lg shadow-sm flex-shrink-0">
                    <Container className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <h1 className="text-base lg:text-xl font-bold flex items-center gap-1 lg:gap-2">
                      <span className="truncate">Compose Toolbox</span>
                      <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-muted-foreground flex-shrink-0" />
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Docker Compose editor and configuration tool
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {/* File Operations */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  File Operations
                </div>
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download YAML File
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Settings
                </div>

                {/* View Mode Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Eye className="w-4 h-4 mr-2" />
                    View Mode
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setView("split")} className={view === "split" ? "bg-accent" : ""}>
                      <Monitor className="w-4 h-4 mr-2" />
                      Split View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setView("editor")}
                      className={view === "editor" ? "bg-accent" : ""}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Editor Only
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setView("configuration")}
                      className={view === "configuration" ? "bg-accent" : ""}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Configuration Only
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Syntax Highlighting */}
                <DropdownMenuItem onClick={() => setSyntaxHighlighting(!syntaxHighlighting)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Syntax Highlighting</span>
                  <div className="ml-auto">
                    <div className={`w-2 h-2 rounded-full ${syntaxHighlighting ? "bg-green-500" : "bg-muted"}`} />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Help & Support */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Help & Support
                </div>
                <DropdownMenuItem onClick={onShowKeyboardShortcuts}>
                  <Keyboard className="w-4 h-4 mr-2" />
                  Shortcuts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowHelp}>
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
