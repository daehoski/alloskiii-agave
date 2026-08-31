import { NextResponse } from "next/server"
import { authenticateUser, createSessionToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = createSessionToken(user)
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    })

    response.cookies.set("alloskiii_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
