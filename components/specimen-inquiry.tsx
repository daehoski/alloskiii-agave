"use client"

import { useState } from "react"

interface SpecimenInquiryProps {
  availability?: string
  price?: string
}

export function SpecimenInquiry({ availability, price }: SpecimenInquiryProps) {
  const [email, setEmail] = useState("")
  const [notified, setNotified] = useState(false)

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setNotified(true)
      setEmail("")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Status & Availability & Conditional Price */}
      <div className="border border-border p-6 bg-secondary/10 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border/60 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Availability
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-primary">
            {availability || "Drop TBA"}
          </span>
        </div>

        {/* Conditional Price Display (Hidden if empty) */}
        {price && (
          <div className="flex justify-between items-baseline border-b border-border/60 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Price
            </span>
            <span className="text-lg md:text-xl font-mono font-semibold text-foreground">
              {price}
            </span>
          </div>
        )}

        <p className="text-xs font-light text-muted-foreground leading-relaxed">
          Plant propagation and future pup release announcements are shared via Instagram and private drop notification.
        </p>
      </div>

      {/* Direct Inquiries & Drop Form */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            [ DIRECT INQUIRY ]
          </span>
          <a
            href="https://instagram.com/alloskiii"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 border border-border bg-secondary/20 hover:bg-secondary/50 text-center text-xs uppercase tracking-widest text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <span>Inquire via Instagram DM</span>
            <span>↗</span>
          </a>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            [ DROP NOTIFICATION ]
          </span>
          {notified ? (
            <p className="text-xs text-primary font-mono uppercase tracking-widest py-2">
              ✓ Registered for this plant's drop alert.
            </p>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for drop alert"
                required
                className="bg-secondary/20 border border-border px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors w-full"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                [NOTIFY]
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
