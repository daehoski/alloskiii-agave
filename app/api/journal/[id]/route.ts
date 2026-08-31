import { NextResponse } from "next/server"
import { updatePost, deletePost } from "@/lib/journal-db"
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
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, subtitle, slug, date, category, coverImage, content, readTime } = body

    const updated = updatePost(numericId, {
      title,
      subtitle,
      slug: slug ? slug.trim().toLowerCase() : undefined,
      date,
      category,
      coverImage,
      content,
      readTime,
    })

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, post: updated })
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const success = deletePost(numericId)
    if (!success) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
