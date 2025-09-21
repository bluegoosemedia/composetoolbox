import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"

const inter = localFont({
  src: [
    {
      path: "/fonts/Inter-VariableFont.ttf",
      style: "normal",
    },
    {
      path: "/fonts/Inter-Italic-VariableFont.ttf",
      style: "italic",
    },
  ],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Compose Toolbox",
  description: "Docker Compose editor and configuration tool",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
  <body className={`${inter.className} h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
