import { NextResponse } from 'next/server'
import path from 'path'
import crypto from 'crypto'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdoygusrcykspccoaqbq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb3lndXNyY3lrc3BjY29hcWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc2OTIxMywiZXhwIjoyMTA0MzQ1MjEzfQ.fdikAfewSqEQkJ8pqfG1-sWPFu72GInKKwuy9_3AOB4'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    let buffer = Buffer.from(await file.arrayBuffer())
    let ext = path.extname(file.name).toLowerCase() || '.jpg'

    if (ext === '.heic' || ext === '.heif') {
      try {
        const heicConvert = (await import('heic-convert')).default
        const converted = await heicConvert({ buffer, format: 'JPEG', quality: 0.88 })
        buffer = Buffer.from(converted)
        ext = '.jpg'
      } catch (convErr) {}
    }

    const safeName = \\-\\\`n
    const { data, error } = await supabase.storage.from('uploads').upload(safeName, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    })
    if (error) throw error

    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(safeName)
    return NextResponse.json({ success: true, url: publicUrlData.publicUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}

