import crypto from "crypto"
import { cookies } from "next/headers"
import { readStorageJson, writeStorageJson } from "./storage-helper"

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

const USERS_FILE = "users.json"
const OTP_FILE = "otps.json"
const SECRET = process.env.AUTH_SECRET || "alloskiii_super_secure_secret_key_2026"

export const ADMIN_EMAIL = "alloskiii8@gmail.com"

export async function getAllUsers(): Promise<User[]> {
  return readStorageJson<User[]>(USERS_FILE, [])
}

export async function getOtps(): Promise<VerificationCode[]> {
  return readStorageJson<VerificationCode[]>(OTP_FILE, [])
}

export async function createVerificationCode(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const otps = (await getOtps()).filter((o) => o.email !== email && o.expiresAt > Date.now())
  otps.push({ email, code, expiresAt: Date.now() + 10 * 60 * 1000, verified: false })
  await writeStorageJson(OTP_FILE, otps)
  return code
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const otps = await getOtps()
  const target = otps.find(
    (o) => o.email.toLowerCase() === email.toLowerCase() && o.code === code && o.expiresAt > Date.now()
  )
  if (!target) return false
  target.verified = true
  await writeStorageJson(OTP_FILE, otps)
  return true
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const otps = await getOtps()
  return otps.some(
    (o) => o.email.toLowerCase() === email.toLowerCase() && o.verified && o.expiresAt > Date.now()
  )
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
}

export async function createUser(email: string, passwordPlain: string): Promise<{ user?: User; error?: string }> {
  const users = await getAllUsers()
  const normalized = email.toLowerCase().trim()

  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    return { error: "User already exists with this email." }
  }

  const salt = crypto.randomBytes(16).toString("hex")
  const passwordHash = hashPassword(passwordPlain, salt)
  const isSuperAdmin = normalized === ADMIN_EMAIL.toLowerCase()

  const newUser: User = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash,
    salt,
    role: isSuperAdmin ? "ADMIN" : "USER",
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  await writeStorageJson(USERS_FILE, users)
  return { user: newUser }
}

export async function authenticateUser(email: string, passwordPlain: string): Promise<User | null> {
  const users = await getAllUsers()
  const normalized = email.toLowerCase().trim()
  const user = users.find((u) => u.email.toLowerCase() === normalized)
  if (!user) return null
  const hash = hashPassword(passwordPlain, user.salt)
  if (hash !== user.passwordHash) return null
  return user
}

export function createSessionToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64")
  const hmac = crypto.createHmac("sha256", SECRET).update(base64).digest("hex")
  return `${base64}.${hmac}`
}

export function verifySessionToken(token: string): { id: string; email: string; role: "ADMIN" | "USER" } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return null
    const [base64, signature] = parts
    const expectedSig = crypto.createHmac("sha256", SECRET).update(base64).digest("hex")
    if (signature !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"))
    if (payload.expiresAt < Date.now()) return null
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role || (payload.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER"),
    }
  } catch { return null }
}

export async function getCurrentUser(): Promise<{ id: string; email: string; role: "ADMIN" | "USER" } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("alloskiii_session")?.value
  if (!token) return null
  return verifySessionToken(token)
}
