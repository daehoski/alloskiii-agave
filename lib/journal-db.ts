import fs from "fs"
import path from "path"
import { INITIAL_JOURNAL_POSTS, type JournalPost } from "./journal-data"

export type { JournalPost }

const DATA_DIR = path.join(process.cwd(), "data")
const JOURNAL_FILE = path.join(DATA_DIR, "journal.json")

function ensureJournalFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(JOURNAL_FILE)) {
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(INITIAL_JOURNAL_POSTS, null, 2), "utf-8")
  }
}

export function getAllPosts(): JournalPost[] {
  try {
    ensureJournalFile()
    const content = fs.readFileSync(JOURNAL_FILE, "utf-8")
    const posts: JournalPost[] = JSON.parse(content)
    // Sort by date descending
    return posts.sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.error("Failed to read journal posts:", error)
    return INITIAL_JOURNAL_POSTS
  }
}

export function getPostBySlug(slug: string): JournalPost | undefined {
  const posts = getAllPosts()
  return posts.find((p) => p.slug === slug)
}

export function addPost(data: Omit<JournalPost, "id" | "createdAt">): JournalPost {
  ensureJournalFile()
  const posts = getAllPosts()
  const nextId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1

  const newPost: JournalPost = {
    ...data,
    id: nextId,
    date: data.date || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  posts.unshift(newPost)
  fs.writeFileSync(JOURNAL_FILE, JSON.stringify(posts, null, 2), "utf-8")
  return newPost
}

export function updatePost(id: number, data: Partial<Omit<JournalPost, "id">>): JournalPost | null {
  ensureJournalFile()
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(JOURNAL_FILE, JSON.stringify(posts, null, 2), "utf-8")
  return posts[index]
}

export function deletePost(id: number): boolean {
  ensureJournalFile()
  const posts = getAllPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false
  fs.writeFileSync(JOURNAL_FILE, JSON.stringify(filtered, null, 2), "utf-8")
  return true
}
