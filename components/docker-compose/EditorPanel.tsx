"use client"

import React from "react"

import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, Plus, Container, Database, Network, HardDrive, Settings, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MonacoEditor } from "./MonacoEditor"
import { getQuickTemplates } from "./utils/templates"

interface EditorSectionProps {
  compose: string
  onChange: (value: string) => void
  syntaxHighlighting: boolean
  view: "split" | "editor" | "configuration"
}

const iconMap = {
  Container: Container,
  Database: Database,
  Network: Network,
  HardDrive: HardDrive,
  Settings: Settings,
  Globe: Globe,
}

export const EditorSection = React.forwardRef<{ goToLine: (line: number) => void }, EditorSectionProps>(
  ({ compose, onChange, syntaxHighlighting, view }, ref) => {
    const editorRef = useRef<{
      insertText: (text: string) => void
      focus: () => void
      goToLine: (line: number) => void
    }>(null)
    const templates = getQuickTemplates()

    const insertTemplate = (template: string) => {
      if (editorRef.current) {
        editorRef.current.insertText("\n" + template)
      } else {
        onChange(compose + "\n" + template)
      }
    }

    const getIcon = (iconName: string) => {
      const IconComponent = iconMap[iconName as keyof typeof iconMap]
      return IconComponent ? <IconComponent className="w-4 h-4" /> : <Container className="w-4 h-4" />
    }

    React.useImperativeHandle(ref, () => ({
      goToLine: (line: number) => {
        if (editorRef.current) {
          editorRef.current.goToLine(line)
        }
      },
    }))

    if (view === "configuration") return null

    return (
      <div className={`${view === "split" ? "w-full lg:w-1/2 h-1/2 lg:h-full" : "w-full h-full"} flex flex-col`}>
        {/* Header */}
        <div className="p-3 lg:p-4 border-b min-h-[60px] lg:min-h-[72px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold flex items-center gap-2 text-sm lg:text-base">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Docker Compose YAML</span>
              <span className="sm:hidden">Editor</span>
            </h2>
            <div className="flex items-center gap-1 lg:gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <span className="hidden sm:inline">{compose.split("\n").length} lines</span>
                <span className="sm:hidden">{compose.split("\n").length}L</span>
              </Badge>
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1 text-xs">
                {compose.length} chars
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quick Insert
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => insertTemplate(templates.service.code)}>
                    {getIcon(templates.service.icon)}
                    <span className="ml-2">{templates.service.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => insertTemplate(templates.database.code)}>
                    {getIcon(templates.database.icon)}
                    <span className="ml-2">{templates.database.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => insertTemplate(templates.network.code)}>
                    {getIcon(templates.network.icon)}
                    <span className="ml-2">{templates.network.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => insertTemplate(templates.volume.code)}>
                    {getIcon(templates.volume.icon)}
                    <span className="ml-2">{templates.volume.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => insertTemplate(templates.environment.code)}>
                    {getIcon(templates.environment.icon)}
                    <span className="ml-2">{templates.environment.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => insertTemplate(templates.ports.code)}>
                    {getIcon(templates.ports.icon)}
                    <span className="ml-2">{templates.ports.name}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Editor Content with responsive padding */}
        <div className="flex-1 p-2 lg:p-4 overflow-hidden">
          <div className="w-full h-full">
            <MonacoEditor
              ref={editorRef}
              value={compose}
              onChange={onChange}
              className="w-full h-full"
              placeholder="Enter your Docker Compose configuration here..."
              syntaxHighlighting={syntaxHighlighting}
            />
          </div>
        </div>
      </div>
    )
  },
)

EditorSection.displayName = "EditorSection"
