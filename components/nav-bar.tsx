"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavBar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isArchive = pathname?.startsWith("/archive")
  const isJournal = pathname?.startsWith("/journal")

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent transition-colors pointer-events-none">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 py-8 flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <Link
          href="/"
          className="font-serif italic text-2xl md:text-3xl text-foreground hover:opacity-70 transition-opacity tracking-tight"
        >
          Alloskiii
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 md:gap-8 text-xs font-semibold uppercase tracking-widest">
          <Link
            href="/"
            className={`transition-colors ${
              isHome
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            INDEX
          </Link>
          <Link
            href="/archive"
            className={`transition-colors ${
              isArchive
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ARCHIVE
          </Link>
          <Link
            href="/journal"
            className={`transition-colors ${
              isJournal
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            JOURNAL
          </Link>
        </nav>
      </div>
    </header>
  )
}
