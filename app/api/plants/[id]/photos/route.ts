import { NextResponse } from "next/server"
import { addGrowthPhoto, deleteGrowthPhoto } from "@/lib/plants-db"
import { getCurrentUser } from "@/lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

// Add a dated growth photo
export async function POST(request: Request, { params }: Props) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const plantId = parseInt(id, 10)

    if (isNaN(plantId)) {
      return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 })
    }

    const { date, src, note, setAsMain } = await request.json()

    if (!src) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const updated = addGrowthPhoto(
      plantId,
      date || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      src,
      note,
      setAsMain !== false
    )

    if (!updated) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, plant: updated })
  } catch (error) {
    console.error("Add growth photo error:", error)
    return NextResponse.json({ error: "Failed to add growth photo" }, { status: 500 })
  }
}

// Delete a photo record
export async function DELETE(request: Request, { params }: Props) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const plantId = parseInt(id, 10)
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("photoId")

    if (isNaN(plantId) || !photoId) {
      return NextResponse.json({ error: "Plant ID and photoId are required" }, { status: 400 })
    }

    const updated = deleteGrowthPhoto(plantId, photoId)
    if (!updated) {
      return NextResponse.json({ error: "Plant or photo not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, plant: updated })
  } catch (error) {
    console.error("Delete growth photo error:", error)
    return NextResponse.json({ error: "Failed to delete growth photo" }, { status: 500 })
  }
}
