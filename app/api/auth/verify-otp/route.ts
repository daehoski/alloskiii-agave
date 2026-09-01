import { NextResponse } from "next/server"
import { verifyCode } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 })
    }

    const isValid = await verifyCode(email, code)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Verification failed." }, { status: 500 })
  }
}
