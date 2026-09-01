import type { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ArchiveFilterGrid } from "@/components/archive-filter-grid"
import { getAllPlants } from "@/lib/plants-db"

export const metadata: Metadata = {
  title: "ARCHIVE | ALLOSKIII Agave Plant Archive",
  description: "Catalogue of Agave Titanota, Oteroi, Horrida, and Utahensis plants.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ArchivePage() {
  const plants = await getAllPlants()

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24">
      <NavBar />

      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="border-b border-border pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-mono">
              [ AGAVE ARCHIVE CATALOGUE ]
            </span>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-none">
              ARCHIVE
            </h1>
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {plants.length} PLANTS RECORDED
          </div>
        </div>

        {/* Category Filter + Plants Grid */}
        <ArchiveFilterGrid initialPlants={plants} />
      </section>

      <Footer />
    </main>
  )
}
