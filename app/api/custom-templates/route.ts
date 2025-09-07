import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface CustomTemplate {
  name: string
  icon: string
  description?: string
  code: string
}

export async function GET() {
  try {
    const customTemplatesPath = join(process.cwd(), "data", "custom-templates", "custom-templates.yml")
    
    // Check if custom templates file exists
    if (!existsSync(customTemplatesPath)) {
      return NextResponse.json({ templates: [] })
    }

    // Read the custom templates file
    const fileContent = readFileSync(customTemplatesPath, "utf-8")
    
    // Simple YAML parsing for our structure
    const templates: CustomTemplate[] = []
    const lines = fileContent.split('\n')
    
    let currentTemplate: Partial<CustomTemplate> | null = null
    let inCodeBlock = false
    let codeLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Start of a new template
      if (trimmed.startsWith('- name:')) {
        // Finish previous code block if we were in one
        if (inCodeBlock && currentTemplate && codeLines.length > 0) {
          currentTemplate.code = codeLines.join('\n').trim()
        }
        
        // Save previous template if exists
        if (currentTemplate && currentTemplate.name && currentTemplate.icon && currentTemplate.code) {
          templates.push(currentTemplate as CustomTemplate)
        }
        
        // Start new template
        currentTemplate = {
          name: trimmed.replace('- name:', '').replace(/['"]/g, '').trim()
        }
        inCodeBlock = false
        codeLines = []
      }
      // Icon field
      else if (trimmed.startsWith('icon:') && currentTemplate) {
        currentTemplate.icon = trimmed.replace('icon:', '').replace(/['"]/g, '').trim()
      }
      // Description field
      else if (trimmed.startsWith('description:') && currentTemplate) {
        currentTemplate.description = trimmed.replace('description:', '').replace(/['"]/g, '').trim()
      }
      // Code field
      else if (trimmed.startsWith('code: |') && currentTemplate) {
        inCodeBlock = true
        codeLines = []
      }
      // Code content (indented lines after code: |)
      else if (inCodeBlock && currentTemplate) {
        if (line.startsWith('      ') || line.startsWith('\t\t\t')) {
          // Remove the first 6 spaces of indentation
          codeLines.push(line.substring(6))
        } else if (trimmed === '' && codeLines.length > 0) {
          // Empty line in code block
          codeLines.push('')
        } else if (trimmed.startsWith('- name:') || (!trimmed.startsWith(' ') && trimmed !== '')) {
          // End of code block
          currentTemplate.code = codeLines.join('\n')
          inCodeBlock = false
          i-- // Re-process this line
        }
      }
    }
    
    // Handle final code block if we're still in one at the end of file
    if (inCodeBlock && currentTemplate && codeLines.length > 0) {
      currentTemplate.code = codeLines.join('\n')
    }
    
    // Save the last template
    if (currentTemplate && currentTemplate.name && currentTemplate.icon && currentTemplate.code) {
      templates.push(currentTemplate as CustomTemplate)
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error reading custom templates:", error)
    return NextResponse.json({ templates: [] })
  }
}
