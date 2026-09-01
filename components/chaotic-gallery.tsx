"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { INITIAL_PLANTS, type PlantItem } from "@/lib/plants-data"

interface ChaoticGalleryProps {
  items?: PlantItem[]
}

// Visual preset patterns for up to 7 items on landing page
const LAYOUT_PRESETS = [
  { span: "col-span-12 md:col-span-6 lg:col-span-5", height: "h-[460px] lg:h-[520px]" },
  { span: "col-span-12 md:col-span-6 lg:col-span-7", height: "h-[460px] lg:h-[520px]" },
  { span: "col-span-12 md:col-span-6 lg:col-span-7", height: "h-[480px] lg:h-[540px]" },
  { span: "col-span-12 md:col-span-6 lg:col-span-5", height: "h-[480px] lg:h-[540px]" },
  { span: "col-span-12 md:col-span-6 lg:col-span-6", height: "h-[460px] lg:h-[500px]" },
  { span: "col-span-12 md:col-span-6 lg:col-span-6", height: "h-[460px] lg:h-[500px]" },
  { span: "col-span-12 lg:col-span-12", height: "h-[500px] lg:h-[580px]" },
]

export function ChaoticGallery({ items = INITIAL_PLANTS }: ChaoticGalleryProps) {
  const [allPlants, setAllPlants] = useState<PlantItem[]>(items && items.length > 0 ? items : INITIAL_PLANTS)

  // Auto-sync with latest plants on mount
  useEffect(() => {
    async function syncLatest() {
      try {
        const res = await fetch("/api/plants", { cache: "no-store" })
        const data = await res.json()
        if (data.plants && data.plants.length > 0) {
          setAllPlants(data.plants)
        }
      } catch (err) {
        console.error("Failed to sync plants:", err)
      }
    }
    syncLatest()
  }, [])

  // Limit to maximum 7 plants on landing page
  const displayItems = allPlants.slice(0, 7)
  const totalCount = allPlants.length

  return (
    <section className="w-full px-4 md:px-12 py-24">
      {/* Featured Header Meta */}
      <div className="flex justify-between items-baseline mb-8 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">
            [ SELECTED HIGHLIGHTS ]
          </span>
          <h2 className="font-serif text-2xl md:text-3xl italic">
            Curated Specimens ({displayItems.length})
          </h2>
        </div>
        <Link
          href="/archive"
          className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
        >
          <span>View All ({totalCount})</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* 7-Item Asymmetric Grid */}
      <div className="grid grid-cols-12 gap-0 border-t border-l border-border">
        {displayItems.map((item, index) => {
          const layout = LAYOUT_PRESETS[index % LAYOUT_PRESETS.length]

          return (
            <motion.div
              key={item.id}
              className={`${layout.span} relative group border-r border-b border-border overflow-hidden bg-secondary/10 transition-colors hover:bg-secondary/30`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Link href={`/archive/${item.slug}`} className="w-full h-full p-4 md:p-8 flex flex-col block">
                {/* Image Container */}
                <div className={`relative w-full ${layout.height} overflow-hidden mb-4 bg-secondary/20`}>
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    style={{ objectPosition: item.coverFit === "contain" ? "center" : (item.coverPosition || "center") }}
                    className={`transition-transform duration-[1.5s] ease-in-out group-hover:scale-105 md:grayscale md:hover:grayscale-0 ${
                      item.coverFit === "contain" ? "object-contain" : "object-cover"
                    }`}
                  />

                  {/* Overlay Lines */}
                  <div className="absolute inset-0 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Category Pill */}
                  {item.category && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/80 backdrop-blur-md border border-border text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                      {item.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mt-auto flex justify-between items-end gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-mono">
                      #{item.number}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl italic">{item.title}</h3>
                    {item.japaneseName && (
                      <p className="text-xs text-muted-foreground font-light mt-0.5">
                        {item.japaneseName}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-[1px] bg-primary/50 group-hover:w-16 transition-all duration-300"></div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom Full Archive Link Button */}
      <div className="mt-16 text-center">
        <Link
          href="/archive"
          className="inline-flex items-center gap-3 px-8 py-4 border border-border bg-secondary/10 hover:bg-secondary/30 text-xs font-mono uppercase tracking-widest text-foreground transition-colors group"
        >
          <span>Explore Complete Archive ({totalCount} Plants)</span>
          <span className="group-hover:translate-x-1.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Chaotic decorative background lines */}
      <div className="relative w-full h-24 mt-12 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border"></div>
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border rotate-12 origin-top"></div>
        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-border -rotate-6 origin-bottom"></div>
      </div>
    </section>
  )
}
