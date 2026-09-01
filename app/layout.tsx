import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "AGAVE TITANOTA | Plant Archive",
  description: "A personal archive documenting Agave Titanota cultivars and cultivation records.",
  generator: 'v0.app'
}

import { AnalyticsTracker } from "@/components/analytics-tracker"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  )
}
