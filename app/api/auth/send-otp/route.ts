import { NextResponse } from "next/server"
import { createVerificationCode, getAllUsers } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const users = await getAllUsers()
    if (users.some((u) => u.email === normalizedEmail)) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 400 })
    }

    const code = await createVerificationCode(normalizedEmail)

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. (Valid for 10 minutes)`,
      // Development preview assistance
      previewCode: code,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send verification code." }, { status: 500 })
  }
}
