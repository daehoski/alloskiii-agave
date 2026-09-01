import { NextResponse } from "next/server"
import { deletePlant, updatePlant } from "@/lib/plants-db"
import { getCurrentUser } from "@/lib/auth"

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const numericId = parseInt(id, 10)

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, japaneseName, slug, number, src, availability, category, price } = body

    const updated = await updatePlant(numericId, {
      title,
      japaneseName,
      slug: slug ? slug.trim().toLowerCase() : undefined,
      number,
      src,
      category: category || "titanota",
      price: price !== undefined ? (price ? price.trim() : "") : undefined,
      availability,
    })

    if (!updated) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, plant: updated })
  } catch (error) {
    console.error("Update plant error:", error)
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const numericId = parseInt(id, 10)

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const success = await deletePlant(numericId)
    if (!success) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete plant error:", error)
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 })
  }
}
