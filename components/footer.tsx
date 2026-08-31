"use client"

import { useState } from "react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <footer className="w-full px-4 md:px-12 py-12 border-t border-border bg-background">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="col-span-1 md:col-span-4">
          <h2 className="font-serif text-4xl mb-4">Private Inquiries</h2>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            Documenting cultivation progress. Future agave drops and releases announced via Instagram.
          </p>
        </div>

        <div className="col-span-1 md:col-span-5 md:col-start-6 flex flex-col gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Archive Contact</span>
            <a
              href="https://instagram.com/alloskiii"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg hover:italic transition-all inline-block"
            >
              Instagram (@alloskiii)
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Agave Drop Notification</span>
            {submitted ? (
              <p className="text-xs text-primary tracking-widest uppercase py-2">
                ✓ Notification Registered. Thank you.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="bg-secondary/20 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors w-full"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  [NOTIFY ME]
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 md:col-start-11 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Social</span>
          <a
            href="https://instagram.com/alloskiii"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="mt-24 flex justify-between items-end">
        <span className="text-[10vw] font-serif leading-none opacity-5 select-none pointer-events-none">ALLOSKIII</span>
        <div className="flex flex-col items-end gap-4">
          <button
            onClick={scrollToTop}
            className="text-xs uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
            type="button"
          >
            Back to Top ↑
          </button>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
