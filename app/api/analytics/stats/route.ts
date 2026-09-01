import { NextResponse } from "next/server"
import { getAnalyticsSummary } from "@/lib/analytics-db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const stats = getAnalyticsSummary()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get analytics stats error:", error)
    return NextResponse.json({ error: "Failed to get analytics stats" }, { status: 500 })
  }
}
