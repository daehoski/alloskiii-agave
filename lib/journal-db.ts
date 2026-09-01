import { INITIAL_JOURNAL_POSTS, type JournalPost } from "./journal-data"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export type { JournalPost }

const JOURNAL_FILE = "journal.json"

export function getAllPosts(): JournalPost[] {
  const posts = readStorageJson<JournalPost[]>(JOURNAL_FILE, INITIAL_JOURNAL_POSTS)
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export function getPostBySlug(slug: string): JournalPost | undefined {
  const posts = getAllPosts()
  return posts.find((p) => p.slug === slug)
}

export function addPost(data: Omit<JournalPost, "id" | "createdAt">): JournalPost {
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
  writeStorageJson(JOURNAL_FILE, posts)
  return newPost
}

export function updatePost(id: number, data: Partial<Omit<JournalPost, "id">>): JournalPost | null {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  writeStorageJson(JOURNAL_FILE, posts)
  return posts[index]
}

export function deletePost(id: number): boolean {
  const posts = getAllPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false
  writeStorageJson(JOURNAL_FILE, filtered)
  return true
}
