import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { logPageView } from "@/lib/analytics-db"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { path, plantSlug, referrer } = body

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1"

    logPageView({
      path,
      plantSlug,
      referrer,
      userAgent,
      ip,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
