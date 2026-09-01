import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

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

    // HEIC/HEIF auto-conversion
    if (ext === ".heic" || ext === ".heif") {
      try {
        const heicConvert = (await import("heic-convert")).default
        const converted = await heicConvert({ buffer, format: "JPEG", quality: 0.88 })
        buffer = Buffer.from(converted)
        ext = ".jpg"
      } catch (convErr) {
        console.error("HEIC conversion error:", convErr)
      }
    }

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`

    // Use Vercel Blob if available (production), else local filesystem (dev)
    const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.BLOB_READ_WRITE_TOKEN)
    
    if (isVercel) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.warn("BLOB_READ_WRITE_TOKEN is missing in Vercel environment! Falling back to Blob API anyway to trigger explicit error.")
      }
      const blob = await put(`uploads/${safeName}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type || "image/jpeg",
      })
      return NextResponse.json({ success: true, url: blob.url })
    } else {
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const filePath = path.join(uploadDir, safeName)
      fs.writeFileSync(filePath, buffer)
      return NextResponse.json({ success: true, url: `/uploads/${safeName}` })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
