"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"

export default function SignUpPage() {
  const router = useRouter()

  // Form States
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Status States
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Messages
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")
    setSuccessMsg("")
    setSendingOtp(true)

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.")
      }

      setOtpSent(true)
      setSuccessMsg(
        data.previewCode
          ? `Verification code sent! [Code: ${data.previewCode}]`
          : "Verification code sent to your email."
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSendingOtp(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code.")
      return
    }

    setError("")
    setSuccessMsg("")
    setVerifyingOtp(true)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.")
      }

      setOtpVerified(true)
      setSuccessMsg("✓ Email verified successfully! Set your password to complete registration.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Step 3: Complete Sign Up
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.")
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/archive")
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative pt-24 pb-16">
      <NavBar />

      <div className="w-full max-w-md border border-border p-8 md:p-10 bg-secondary/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            [ SECURE REGISTRATION ]
          </span>
          <h1 className="font-serif text-3xl md:text-4xl italic mb-2">Account Sign Up</h1>
          <p className="text-xs text-muted-foreground">
            Verify your email address to register your account.
          </p>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-6 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono">
            {successMsg}
          </div>
        )}

        {/* Form Flow */}
        {!otpVerified ? (
          <div className="flex flex-col gap-5">
            {/* Email Input & Send OTP */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={otpSent}
                  required
                  className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="px-4 py-2.5 bg-foreground text-background text-[11px] font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap cursor-pointer"
                >
                  {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send Code"}
                </button>
              </div>
            </div>

            {/* OTP Input & Verify */}
            {otpSent && (
              <div className="pt-2 border-t border-border/60">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
                  6-Digit Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    required
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otpCode.length !== 6}
                    className="px-4 py-2.5 bg-foreground text-background text-[11px] font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap cursor-pointer"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Password Setup Form */
          <form onSubmit={handleCompleteSignUp} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
                Verified Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs font-mono text-muted-foreground cursor-not-allowed opacity-75"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
                Set Password (Min 6 chars)
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

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5 font-mono">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-foreground text-background text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating Account..." : "Complete Registration →"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground hover:underline underline-offset-4 ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
