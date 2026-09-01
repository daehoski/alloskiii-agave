import fs from "fs"
import path from "path"
import { put, list, del } from "@vercel/blob"

// Check if Vercel Blob is available (production on Vercel)
function isBlobAvailable(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.BLOB_READ_WRITE_TOKEN)
}

// ──────────────────────────────
// Vercel Blob Storage (Production - Persistent!)
// ──────────────────────────────
async function readBlobJson<T>(key: string, defaultData: T): Promise<T> {
  try {
    // If key is 'data/plants.json', list with prefix 'data/plants' to match 'data/plants-xyz.json'
    const prefix = key.endsWith('.json') ? key.slice(0, -5) : key
    const { blobs } = await list({ prefix })
    
    if (!blobs || blobs.length === 0) return defaultData

    // Sort to get the latest blob
    const sorted = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
    const latest = sorted[0]

    // Fetch with cachebuster to prevent CDN stale caching
    const res = await fetch(`${latest.url}?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    })

    if (!res.ok) return defaultData
    return await res.json()
  } catch (err) {
    console.error(`Blob read error [${key}]:`, err)
    return defaultData
  }
}

async function writeBlobJson<T>(key: string, data: T): Promise<void> {
  try {
    // 1. Write the new version with random suffix to avoid 409 Conflict
    const newBlob = await put(`${key}`, JSON.stringify(data), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    })

    // 2. Clean up previous versions (keep only the newest one)
    try {
      const prefix = key.endsWith('.json') ? key.slice(0, -5) : key
      const { blobs } = await list({ prefix })
      const oldBlobs = blobs.filter((b) => b.url !== newBlob.url)
      for (const old of oldBlobs) {
        await del(old.url).catch(() => {})
      }
    } catch (cleanupErr) {
      console.warn("Blob cleanup error (non-fatal):", cleanupErr)
    }
  } catch (err) {
    console.error(`Blob write error [${key}]:`, err)
    throw err
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
