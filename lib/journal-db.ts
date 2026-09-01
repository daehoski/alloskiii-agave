import { INITIAL_JOURNAL_POSTS, type JournalPost } from "./journal-data"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export type { JournalPost }

const JOURNAL_FILE = "journal.json"

export async function getAllPosts(): Promise<JournalPost[]> {
  const posts = await readStorageJson<JournalPost[]>(JOURNAL_FILE, INITIAL_JOURNAL_POSTS)
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getPostBySlug(slug: string): Promise<JournalPost | undefined> {
  const posts = await getAllPosts()
  return posts.find((p) => p.slug === slug)
}

export async function addPost(data: Omit<JournalPost, "id" | "createdAt">): Promise<JournalPost> {
  const posts = await getAllPosts()
  const nextId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1

  const newPost: JournalPost = {
    ...data,
    id: nextId,
    date: data.date || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  posts.unshift(newPost)
  await writeStorageJson(JOURNAL_FILE, posts)
  return newPost
}

export async function updatePost(id: number, data: Partial<Omit<JournalPost, "id">>): Promise<JournalPost | null> {
  const posts = await getAllPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  posts[index] = { ...posts[index], ...data, updatedAt: new Date().toISOString() }
  await writeStorageJson(JOURNAL_FILE, posts)
  return posts[index]
}

export async function deletePost(id: number): Promise<boolean> {
  const posts = await getAllPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false
  await writeStorageJson(JOURNAL_FILE, filtered)
  return true
}
