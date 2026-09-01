"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CATEGORIES, type PlantItem } from "@/lib/plants-data"

interface ArchiveFilterGridProps {
  initialPlants: PlantItem[]
}

export function ArchiveFilterGrid({ initialPlants }: ArchiveFilterGridProps) {
  const [plants, setPlants] = useState<PlantItem[]>(initialPlants)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"latest" | "number">("latest")

  // Auto-sync with latest API on mount
  useEffect(() => {
    async function syncLatest() {
      try {
        const res = await fetch(`/api/plants?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
        const data = await res.json()
        if (data.plants) {
          setPlants(data.plants)
        }
      } catch (err) {
        console.error("Failed to sync plants:", err)
      }
    }
    syncLatest()
  }, [])

  // Filter and sort plants
  const processedPlants = useMemo(() => {
    // 1. Filter by category
    const filtered =
      selectedCategory === "all"
        ? [...plants]
        : plants.filter(
            (p) =>
              p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
              p.title.toLowerCase().includes(selectedCategory.toLowerCase())
          )

    // 2. Sort
    if (sortBy === "latest") {
      filtered.sort((a, b) => {
        const dateA = a.photos?.[0]?.date || a.updatedAt || a.createdAt || ""
        const dateB = b.photos?.[0]?.date || b.updatedAt || b.createdAt || ""
        return dateB.localeCompare(dateA)
      })
    } else {
      filtered.sort((a, b) => {
        const numA = parseInt(a.number, 10) || a.id
        const numB = parseInt(b.number, 10) || b.id
        return numA - numB
      })
    }

    return filtered
  }, [plants, selectedCategory, sortBy])

  return (
    <div>
      {/* Filter and Sort Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
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
        </div>

        {/* Sort Controls & Count */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 bg-secondary/10">
            <span className="text-muted-foreground uppercase">Sort:</span>
            <button
              onClick={() => setSortBy("latest")}
              className={`px-2 py-0.5 uppercase transition-colors cursor-pointer ${
                sortBy === "latest" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Latest (최신순)
            </button>
            <button
              onClick={() => setSortBy("number")}
              className={`px-2 py-0.5 uppercase transition-colors cursor-pointer ${
                sortBy === "number" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              No. (번호순)
            </button>
          </div>

          <div className="text-muted-foreground whitespace-nowrap">
            {processedPlants.length} / {initialPlants.length} Plants
          </div>
        </div>
      </div>

      {/* Grid List */}
      {processedPlants.length === 0 ? (
        <div className="py-24 text-center border border-border bg-secondary/5 font-mono text-xs text-muted-foreground">
          No plants found matching the selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-border">
          {processedPlants.map((plant) => {
            const latestPhoto = plant.photos?.[0]
            const displayImage = latestPhoto?.src || plant.src
            const latestDate = latestPhoto?.date

            return (
              <Link
                key={plant.slug}
                href={`/archive/${plant.slug}`}
                className="group relative border-r border-b border-border bg-secondary/10 hover:bg-secondary/30 transition-colors flex flex-col p-6 md:p-10"
              >
                {/* Header Number, Category & Latest Photo Date Badge */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                      No. {plant.number}
                    </span>
                    {plant.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-border/60 bg-background/50 text-muted-foreground">
                        {plant.category}
                      </span>
                    )}
                    {latestDate && (
                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/5">
                        📅 {latestDate}
                      </span>
                    )}
                  </div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors font-mono">
                    View Record →
                  </span>
                </div>

                {/* Image Thumbnail (4:3 Ratio with cover/contain support) */}
                <div className="relative w-full aspect-[4/3] overflow-hidden mb-6 bg-black/40 border border-border/30">
                  <Image
                    src={displayImage}
                    alt={plant.title}
                    fill
                    style={{ objectPosition: plant.coverFit === "contain" ? "center" : (plant.coverPosition || "center") }}
                    className={`transition-transform duration-700 ease-out group-hover:scale-105 md:grayscale md:group-hover:grayscale-0 ${
                      plant.coverFit === "contain" ? "object-contain" : "object-cover"
                    }`}
                  />
                  {plant.photos && plant.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-background/80 backdrop-blur-md border border-border text-[10px] font-mono text-foreground">
                      📷 {plant.photos.length} Logs
                    </div>
                  )}
                </div>

                {/* Title, Japanese Name & Conditional Price */}
                <div className="mt-auto flex justify-between items-end gap-4">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl tracking-tight group-hover:translate-x-1 transition-transform mb-1">
                      {plant.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-light">
                      {plant.japaneseName || "—"}
                    </p>
                  </div>

                  {/* Conditional Price Display (Only when set) */}
                  {plant.price && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block">
                        Price
                      </span>
                      <span className="text-sm md:text-base font-mono font-medium text-primary">
                        {plant.price}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
