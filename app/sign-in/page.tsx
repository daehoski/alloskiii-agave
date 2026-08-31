"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in")
      }

      router.push(next)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md border border-border p-8 md:p-10 bg-secondary/10 backdrop-blur-md">
      <div className="mb-8 text-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
          [ RESTRICTED ACCESS ]
        </span>
        <h1 className="font-serif text-3xl md:text-4xl italic mb-2">Admin Sign In</h1>
        <p className="text-xs text-muted-foreground">
          Enter credentials to manage plant archives and media.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
            Admin Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authenticating..." : "Sign In →"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          Need to initialize first admin?{" "}
          <Link href="/sign-up" className="text-foreground hover:underline underline-offset-4 ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative pt-20">
      <NavBar />
      <Suspense fallback={<div className="text-xs font-mono text-muted-foreground">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </main>
  )
}
