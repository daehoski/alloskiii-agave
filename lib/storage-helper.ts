import fs from "fs"
import path from "path"
import { put, list } from "@vercel/blob"

// Check if Vercel Blob is available (production on Vercel)
function isBlobAvailable(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

// ──────────────────────────────
// Vercel Blob Storage (Production - Persistent!)
// ──────────────────────────────
async function readBlobJson<T>(key: string, defaultData: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: key })
    if (blobs.length === 0) return defaultData

    // Use the most recent blob
    const latest = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]

    const res = await fetch(latest.url, { cache: "no-store" })
    if (!res.ok) return defaultData
    return await res.json()
  } catch (err) {
    console.error(`Blob read error [${key}]:`, err)
    return defaultData
  }
}

async function writeBlobJson<T>(key: string, data: T): Promise<void> {
  try {
    // Clean up old blobs with same prefix to avoid clutter
    const { blobs } = await list({ prefix: key })
    
    // Write new blob
    await put(key, JSON.stringify(data), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    })

    // Delete old versions (keep only latest)
    if (blobs.length > 0) {
      const { del } = await import("@vercel/blob")
      for (const old of blobs) {
        try { await del(old.url) } catch {}
      }
    }
  } catch (err) {
    console.error(`Blob write error [${key}]:`, err)
  }
}

// ──────────────────────────────
// Local Filesystem Storage (Development)
// ──────────────────────────────
function getLocalPath(fileName: string): string {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return path.join(dataDir, fileName)
}

function readLocalJson<T>(fileName: string, defaultData: T): T {
  try {
    const filePath = getLocalPath(fileName)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error(`Local read error [${fileName}]:`, err)
  }
  return defaultData
}

function writeLocalJson<T>(fileName: string, data: T): void {
  try {
    const filePath = getLocalPath(fileName)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error(`Local write error [${fileName}]:`, err)
  }
}

// ──────────────────────────────
// Unified API (auto-detects environment)
// ──────────────────────────────
export async function readStorageJson<T>(fileName: string, defaultData: T): Promise<T> {
  if (isBlobAvailable()) {
    return readBlobJson<T>(`data/${fileName}`, defaultData)
  }
  return readLocalJson<T>(fileName, defaultData)
}

export async function writeStorageJson<T>(fileName: string, data: T): Promise<void> {
  if (isBlobAvailable()) {
    await writeBlobJson<T>(`data/${fileName}`, data)
  } else {
    writeLocalJson<T>(fileName, data)
  }
}
