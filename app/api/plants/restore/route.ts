import { NextResponse } from "next/server"
import { restorePlant, getDeletedPlants } from "@/lib/plants-db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const deletedPlants = await getDeletedPlants()
    return NextResponse.json({ deletedPlants })
  } catch (error) {
    console.error("Get deleted plants error:", error)
    return NextResponse.json({ error: "Failed to get deleted plants" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { id } = body

    const restored = await restorePlant(id ? parseInt(id, 10) : undefined)
    if (!restored) {
      return NextResponse.json({ error: "No plant to restore" }, { status: 404 })
    }

    return NextResponse.json({ success: true, plant: restored })
  } catch (error) {
    console.error("Restore plant error:", error)
    return NextResponse.json({ error: "Failed to restore plant" }, { status: 500 })
  }
}
