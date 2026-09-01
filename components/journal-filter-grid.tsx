"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { JOURNAL_CATEGORIES, type JournalPost } from "@/lib/journal-data"

interface JournalFilterGridProps {
  initialPosts: JournalPost[]
}

export function JournalFilterGrid({ initialPosts }: JournalFilterGridProps) {
  const [posts, setPosts] = useState<JournalPost[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Auto-sync with latest journal on mount
  useEffect(() => {
    async function syncLatest() {
      try {
        const res = await fetch(`/api/journal?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
        const data = await res.json()
        if (data.posts) {
          setPosts(data.posts)
        }
      } catch (err) {
        console.error("Failed to sync journal:", err)
      }
    }
    syncLatest()
  }, [])

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        )

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-10 pb-6 border-b border-border">
        {JOURNAL_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer ${
                isActive
                  ? "bg-foreground text-background font-semibold"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              [ {cat.label} ]
            </button>
          )
        })}

        <div className="ml-auto text-xs font-mono text-muted-foreground">
          {filteredPosts.length} / {initialPosts.length} Articles
        </div>
      </div>

      {/* Grid List */}
      {filteredPosts.length === 0 ? (
        <div className="py-24 text-center border border-border bg-secondary/5 font-mono text-xs text-muted-foreground">
          No journal articles found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-border">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group relative border-r border-b border-border bg-secondary/10 hover:bg-secondary/30 transition-colors flex flex-col p-6 md:p-10"
            >
              {/* Meta Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground tracking-widest">
                    {post.date}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-border/60 bg-background/50 text-muted-foreground">
                    {post.category}
                  </span>
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  Read Article →
                </span>
              </div>

              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden mb-6 bg-secondary/20 border border-border/50">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 md:grayscale md:group-hover:grayscale-0"
                  />
                </div>
              )}

              {/* Titles */}
              <div className="mt-auto">
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight group-hover:translate-x-1 transition-transform mb-2">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-xs md:text-sm text-muted-foreground font-light leading-relaxed line-clamp-2">
                    {post.subtitle}
                  </p>
                )}
                {post.readTime && (
                  <span className="text-[10px] font-mono text-muted-foreground/70 block mt-3 uppercase tracking-wider">
                    — {post.readTime}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
