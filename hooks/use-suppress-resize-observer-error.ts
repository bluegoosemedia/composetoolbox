"use client"

import { useEffect } from "react"

/**
 * Silences benign ResizeObserver loop errors that some browsers emit
 * when Monaco or other virtual-scroll components re-lay out quickly.
 */
export function useSuppressResizeObserverError() {
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (
        e.message?.includes("ResizeObserver loop") ||
        e.message?.includes("ResizeObserver loop completed") ||
        e.message?.includes("ResizeObserver loop limit exceeded")
      ) {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    }

    // `error` catches Chrome / Edge, `unhandledrejection` covers others
    window.addEventListener("error", handler)
    window.addEventListener("unhandledrejection", handler)

    return () => {
      window.removeEventListener("error", handler)
      window.removeEventListener("unhandledrejection", handler)
    }
  }, [])
}
