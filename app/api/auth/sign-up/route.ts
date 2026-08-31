import { NextResponse } from "next/server"
import { createUser, createSessionToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (min 6 characters) are required." },
        { status: 400 }
      )
    }

    const result = createUser(email, password)
    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || "Failed to create account" }, { status: 400 })
    }

    const token = createSessionToken(result.user)
    const response = NextResponse.json({
      success: true,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    })

    response.cookies.set("alloskiii_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Sign-up error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
