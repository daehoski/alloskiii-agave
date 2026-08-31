import { NextResponse } from "next/server"
import { getAllPlants, addPlant } from "@/lib/plants-db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const plants = getAllPlants()
  return NextResponse.json({ plants })
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, japaneseName, slug, number, src, availability, category, price } = body

    if (!title || !slug || !src) {
      return NextResponse.json(
        { error: "Title, slug, and image are required" },
        { status: 400 }
      )
    }

    const newPlant = addPlant({
      title,
      japaneseName: japaneseName || "",
      slug: slug.trim().toLowerCase(),
      number: number || "01",
      src,
      category: category || "titanota",
      price: price ? price.trim() : undefined,
      availability: availability || "Private Collection (Drop TBA)",
    })

    return NextResponse.json({ success: true, plant: newPlant })
  } catch (error) {
    console.error("Add plant error:", error)
    return NextResponse.json({ error: "Failed to add plant" }, { status: 500 })
  }
}
