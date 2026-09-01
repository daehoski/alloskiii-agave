"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Exclude admin panel internal routes from general visitor counts
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return

    let plantSlug: string | undefined
    if (pathname.startsWith("/archive/")) {
      plantSlug = pathname.replace("/archive/", "")
    }

    const payload = {
      path: pathname,
      plantSlug,
      referrer: document.referrer || "direct",
    }

    // Fire non-blocking beacon
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
        navigator.sendBeacon("/api/analytics/track", blob)
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // Ignore network errors on tracking
    }
  }, [pathname])

  return null
}
