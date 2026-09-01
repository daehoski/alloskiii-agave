import fs from "fs"
import path from "path"
import os from "os"

// Determines the writable data directory.
// On Vercel / serverless environments, process.cwd()/data is read-only, so we use os.tmpdir().
export function getStorageFilePath(fileName: string, defaultData: any): string {
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
  const baseDir = isVercel ? os.tmpdir() : path.join(process.cwd(), "data")
  const targetFile = path.join(baseDir, fileName)

  try {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    if (!fs.existsSync(targetFile)) {
      // Try copying from project data directory first
      const sourceFile = path.join(process.cwd(), "data", fileName)
      if (fs.existsSync(sourceFile)) {
        const sourceContent = fs.readFileSync(sourceFile, "utf-8")
        fs.writeFileSync(targetFile, sourceContent, "utf-8")
      } else {
        fs.writeFileSync(targetFile, JSON.stringify(defaultData, null, 2), "utf-8")
      }
    }
  } catch (err) {
    console.error(`Storage helper initialization error for ${fileName}:`, err)
  }

  return targetFile
}

export function readStorageJson<T>(fileName: string, defaultData: T): T {
  try {
    const filePath = getStorageFilePath(fileName, defaultData)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error(`Failed to read storage file ${fileName}:`, err)
  }
  return defaultData
}

export function writeStorageJson<T>(fileName: string, data: T): void {
  try {
    const filePath = getStorageFilePath(fileName, data)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error(`Failed to write storage file ${fileName}:`, err)
  }
}
