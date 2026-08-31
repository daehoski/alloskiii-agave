import fs from "fs"
import path from "path"
import crypto from "crypto"
import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  role: "ADMIN" | "USER"
  createdAt: string
}

export interface VerificationCode {
  email: string
  code: string
  expiresAt: number
  verified: boolean
}

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const OTP_FILE = path.join(DATA_DIR, "otps.json")
const SECRET = process.env.AUTH_SECRET || "alloskiii_super_secure_secret_key_2026"

// Designated primary administrator email
export const ADMIN_EMAIL = "alloskiii8@gmail.com"

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8")
  }
  if (!fs.existsSync(OTP_FILE)) {
    fs.writeFileSync(OTP_FILE, JSON.stringify([], null, 2), "utf-8")
  }
}

export function getAllUsers(): User[] {
  try {
    ensureFiles()
    const content = fs.readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error("Failed to read users:", error)
    return []
  }
}

export function getOtps(): VerificationCode[] {
  try {
    ensureFiles()
    const content = fs.readFileSync(OTP_FILE, "utf-8")
    return JSON.parse(content)
  } catch {
    return []
  }
}

export function saveOtps(otps: VerificationCode[]) {
  ensureFiles()
  fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2), "utf-8")
}

// Generate & Store 6-digit OTP
export function createVerificationCode(email: string): string {
  const normalizedEmail = email.trim().toLowerCase()
  const code = Math.floor(100000 + Math.random() * 900000).toString() // 6 digits
  const expiresAt = Date.now() + 1000 * 60 * 10 // 10 minutes

  let otps = getOtps().filter((o) => o.email !== normalizedEmail && o.expiresAt > Date.now())
  otps.push({
    email: normalizedEmail,
    code,
    expiresAt,
    verified: false,
  })

  saveOtps(otps)
  console.log(`\n========================================\n[EMAIL OTP CODE for ${normalizedEmail}]: ${code}\n========================================\n`)
  return code
}

// Verify OTP
export function verifyCode(email: string, inputCode: string): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  const otps = getOtps()
  const item = otps.find((o) => o.email === normalizedEmail && o.code === inputCode.trim() && o.expiresAt > Date.now())

  if (!item) return false

  item.verified = true
  saveOtps(otps)
  return true
}

// Check if email was verified for signup
export function isEmailVerified(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  const otps = getOtps()
  return otps.some((o) => o.email === normalizedEmail && o.verified && o.expiresAt > Date.now())
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const currentSalt = salt || crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, currentSalt, 1000, 64, "sha512").toString("hex")
  return { hash, salt: currentSalt }
}

export function createUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  ensureFiles()
  const users = getAllUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((u) => u.email === normalizedEmail)) {
    return { success: false, error: "Email already registered." }
  }

  if (!isEmailVerified(normalizedEmail)) {
    return { success: false, error: "Email has not been verified. Please complete email code verification first." }
  }

  // Only alloskiii8@gmail.com gets ADMIN role
  const role: "ADMIN" | "USER" = normalizedEmail === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER"

  const { hash, salt } = hashPassword(password)
  const newUser: User = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")

  // Remove used OTP
  const otps = getOtps().filter((o) => o.email !== normalizedEmail)
  saveOtps(otps)

  return { success: true, user: newUser }
}

export function authenticateUser(email: string, password: string): User | null {
  const users = getAllUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find((u) => u.email === normalizedEmail)
  if (!user) return null

  const { hash } = hashPassword(password, user.salt)
  if (hash === user.passwordHash) {
    // Ensure alloskiii8@gmail.com always has ADMIN role even if created earlier
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && user.role !== "ADMIN") {
      user.role = "ADMIN"
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
    }
    return user
  }
  return null
}

export function createSessionToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  }
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", SECRET).update(payloadStr).digest("base64url")
  return `${payloadStr}.${signature}`
}

export function verifySessionToken(token: string): { id: string; email: string; role: "ADMIN" | "USER" } | null {
  try {
    const [payloadStr, signature] = token.split(".")
    if (!payloadStr || !signature) return null

    const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadStr).digest("base64url")
    if (signature !== expectedSig) return null

    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"))
    if (payload.exp && payload.exp < Date.now()) {
      return null
    }
    return { id: payload.id, email: payload.email, role: payload.role || "USER" }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<{ id: string; email: string; role: "ADMIN" | "USER" } | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("alloskiii_session")?.value
  if (!sessionToken) return null
  return verifySessionToken(sessionToken)
}
