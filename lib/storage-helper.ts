import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdoygusrcykspccoaqbq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb3lndXNyY3lrc3BjY29hcWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc2OTIxMywiZXhwIjoyMTA0MzQ1MjEzfQ.fdikAfewSqEQkJ8pqfG1-sWPFu72GInKKwuy9_3AOB4'
const supabase = createClient(supabaseUrl, supabaseKey)

async function readSupabaseJson<T>(fileName: string, defaultData: T): Promise<T> {
  try {
    const { data: fileData, error: fileError } = await supabase.storage.from('data').download(fileName)
    if (fileError || !fileData) return defaultData
    const text = await fileData.text()
    return JSON.parse(text)
  } catch (err) {
    return defaultData
  }
}

async function writeSupabaseJson<T>(fileName: string, data: T): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2)
  await supabase.storage.from('data').upload(fileName, jsonStr, { contentType: 'application/json', upsert: true })
}

export async function readStorageJson<T>(fileName: string, defaultData: T): Promise<T> {
  return readSupabaseJson<T>(fileName, defaultData)
}

export async function writeStorageJson<T>(fileName: string, data: T): Promise<void> {
  await writeSupabaseJson<T>(fileName, data)
}

