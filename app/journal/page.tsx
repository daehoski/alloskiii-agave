import type { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { JournalFilterGrid } from "@/components/journal-filter-grid"
import { getAllPosts } from "@/lib/journal-db"

export const metadata: Metadata = {
  title: "JOURNAL | ALLOSKIII Cultivation Notes & Articles",
  description: "Essays, cultivation insights, microclimate studies, and drop notices on Agave Titanota.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function JournalPage() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24">
      <NavBar />

      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="border-b border-border pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-mono">
              [ CULTIVATION ESSAYS & FIELD NOTES ]
            </span>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-none">
              JOURNAL
            </h1>
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {posts.length} ARTICLES PUBLISHED
          </div>
        </div>

        {/* Filter and Grid */}
        <JournalFilterGrid initialPosts={posts} />
      </section>

      <Footer />
    </main>
  )
}
