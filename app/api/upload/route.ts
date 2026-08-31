import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), "public", "uploads")

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const ext = path.extname(file.name) || ".jpg"
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
    const filePath = path.join(uploadDir, safeName)

    fs.writeFileSync(filePath, buffer)

    const fileUrl = `/uploads/${safeName}`
    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
