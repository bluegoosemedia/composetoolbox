import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Path to the template file
    const templatePath = join(process.cwd(), 'app', 'data', 'startup', 'startup-template.yml')
    
    // Read the template file
    const templateContent = readFileSync(templatePath, 'utf8')
    
    return NextResponse.json({ 
      content: templateContent,
      success: true 
    })
  } catch (error) {
    console.error('Failed to load startup template:', error)
    
    // Fallback to a basic template if file read fails
    const fallbackTemplate = `services:
  composetoolbox:
    image: ghcr.io/bluegoosemedia/composetoolbox
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped`

    return NextResponse.json({ 
      content: fallbackTemplate,
      success: false,
      error: 'Failed to load startup template file, using fallback'
    })
  }
}
