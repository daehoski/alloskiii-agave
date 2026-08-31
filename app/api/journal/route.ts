import { NextResponse } from "next/server"
import { getAllPosts, addPost } from "@/lib/journal-db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const posts = getAllPosts()
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, subtitle, slug, date, category, coverImage, content, readTime } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required." },
        { status: 400 }
      )
    }

    const newPost = addPost({
      title,
      subtitle: subtitle || "",
      slug: slug.trim().toLowerCase(),
      date: date || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      category: category || "cultivation",
      coverImage: coverImage || "",
      content,
      readTime: readTime || "3 min read",
    })

    return NextResponse.json({ success: true, post: newPost })
  } catch (error) {
    console.error("Add journal post error:", error)
    return NextResponse.json({ error: "Failed to add journal post" }, { status: 500 })
  }
}
