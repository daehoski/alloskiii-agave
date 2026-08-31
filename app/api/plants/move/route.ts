import { NextResponse } from "next/server"
import { movePlant } from "@/lib/plants-db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id, direction } = await request.json()

    if (!id || !["top", "up", "down"].includes(direction)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    const success = movePlant(parseInt(id, 10), direction)
    if (!success) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Move plant error:", error)
    return NextResponse.json({ error: "Failed to move plant" }, { status: 500 })
  }
}
