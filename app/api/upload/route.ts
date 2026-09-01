import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { getCurrentUser } from "@/lib/auth"
import heicConvert from "heic-convert"

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

    let buffer: Buffer = Buffer.from(await file.arrayBuffer())
    let ext = path.extname(file.name).toLowerCase() || ".jpg"
    let mimeType = file.type || "image/jpeg"

    // Convert iPhone HEIC/HEIF to JPEG automatically
    if (ext === ".heic" || ext === ".heif" || (file.type && file.type.includes("heic"))) {
      try {
        const converted = await heicConvert({
          buffer: buffer,
          format: "JPEG",
          quality: 0.88,
        })
        buffer = Buffer.from(converted)
        ext = ".jpg"
        mimeType = "image/jpeg"
      } catch (convErr) {
        console.error("HEIC conversion error:", convErr)
      }
    }

    // Try saving to public/uploads (local dev), fallback to Data URI on serverless (Vercel)
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
    let fileUrl = ""

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const filePath = path.join(uploadDir, safeName)
      fs.writeFileSync(filePath, buffer)
      fileUrl = `/uploads/${safeName}`
    } catch {
      // Vercel serverless environment (read-only filesystem) -> Return Base64 Data URI
      const base64Data = buffer.toString("base64")
      fileUrl = `data:${mimeType};base64,${base64Data}`
    }

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
