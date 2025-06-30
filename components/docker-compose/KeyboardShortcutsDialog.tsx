"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Navigation, MousePointer, Lightbulb } from "lucide-react"

interface KeyboardShortcutsDialogProps {
  show: boolean
  onClose: () => void
}

export function KeyboardShortcutsDialog({ show, onClose }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: "Editor Shortcuts",
      icon: <Edit className="w-5 h-5" />,
      items: [
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Y"], description: "Redo" },
        { keys: ["Ctrl", "F"], description: "Find" },
        { keys: ["Ctrl", "H"], description: "Find and replace" },
        { keys: ["Ctrl", "G"], description: "Go to line" },
        { keys: ["Tab"], description: "Indent selected lines" },
        { keys: ["Shift", "Tab"], description: "Unindent selected lines" },
        { keys: ["Ctrl", "A"], description: "Select all" },
        { keys: ["Ctrl", "C"], description: "Copy" },
        { keys: ["Ctrl", "V"], description: "Paste" },
        { keys: ["Ctrl", "X"], description: "Cut" },
      ],
    },
    {
      category: "Navigation",
      icon: <Navigation className="w-5 h-5" />,
      items: [
        { keys: ["Ctrl", "Home"], description: "Go to beginning of file" },
        { keys: ["Ctrl", "End"], description: "Go to end of file" },
        { keys: ["Home"], description: "Go to beginning of line" },
        { keys: ["End"], description: "Go to end of line" },
        { keys: ["Ctrl", "←"], description: "Move cursor by word left" },
        { keys: ["Ctrl", "→"], description: "Move cursor by word right" },
      ],
    },
    {
      category: "Selection",
      icon: <MousePointer className="w-5 h-5" />,
      items: [
        { keys: ["Shift", "←"], description: "Select character left" },
        { keys: ["Shift", "→"], description: "Select character right" },
        { keys: ["Ctrl", "Shift", "←"], description: "Select word left" },
        { keys: ["Ctrl", "Shift", "→"], description: "Select word right" },
        { keys: ["Shift", "Home"], description: "Select to beginning of line" },
        { keys: ["Shift", "End"], description: "Select to end of line" },
      ],
    },
  ]

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Complete list of keyboard shortcuts for Compose Toolbox</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                  {category.icon}
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge key={keyIndex} variant="outline" className="text-xs font-mono">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Tips
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• All editor shortcuts work within the Monaco editor</li>
              <li>• Use the footer buttons for application functions (Help, Shortcuts, View toggle)</li>
              <li>• Press Esc to close any open dialog</li>
              <li>• The editor supports standard text editing shortcuts</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
