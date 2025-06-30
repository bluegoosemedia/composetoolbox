import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ComposeToolbox",
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

        {/* Silence benign ResizeObserver loop errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const handler = function (e) {
                  if (
                    e && e.message &&
                    (
                      e.message.includes('ResizeObserver loop') ||
                      e.message.includes('ResizeObserver loop limit exceeded') ||
                      e.message.includes('ResizeObserver loop completed with undelivered notifications')
                    )
                  ) {
                    e.stopImmediatePropagation();
                    if (e.preventDefault) e.preventDefault();
                  }
                };
                window.addEventListener('error', handler, true);
                window.addEventListener('unhandledrejection', handler, true);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
