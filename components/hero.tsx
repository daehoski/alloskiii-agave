"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 200])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden px-6 md:px-12 pt-20 pb-12 bg-background">
      {/* Subtle Geometric Background Lines (From Original Design) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0">
        <div className="relative w-full max-w-[1400px] h-[80vh]">
          {/* Diagonal Cross Lines */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-border"></div>
          <div className="absolute inset-0 w-full h-full border border-border/40 rotate-45 scale-75 origin-center"></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="z-10 w-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center mt-12 md:mt-0">
        <motion.div
          className="col-span-1 md:col-span-8 md:col-start-2"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="font-serif text-[13vw] md:text-[11vw] leading-[0.82] tracking-tight text-foreground select-none">
            AGAVE <br />
            <span className="italic font-normal ml-[12vw] md:ml-[16vw] inline-block">
              TITANOTA
            </span>
          </h1>
        </motion.div>

        <motion.div
          className="col-span-1 md:col-span-3 md:col-start-9 mt-12 md:mt-24 flex flex-col gap-5"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        >
          <p className="text-sm font-light text-muted-foreground max-w-[260px] leading-relaxed">
            A personal archive documenting Agave Titanota cultivars and growth records.
          </p>
          <div className="h-[1px] w-20 bg-border"></div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground/80 font-medium">
            EST. 2026 — AGAVE ARCHIVE
          </p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 pointer-events-none"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
          SCROLL
        </span>
        <div className="w-[1px] h-10 bg-muted-foreground/60"></div>
      </motion.div>
    </section>
  )
}
