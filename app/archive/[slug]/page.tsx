import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { SpecimenInquiry } from "@/components/specimen-inquiry"
import { PlantImageGallery } from "@/components/plant-image-gallery"
import { getAllPlants, getPlantBySlug } from "@/lib/plants-db"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const plants = getAllPlants()
  return plants.map((plant) => ({
    slug: plant.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const specimen = getPlantBySlug(slug)
  if (!specimen) return { title: "Plant Not Found" }

  return {
    title: `${specimen.title} (${specimen.japaneseName}) — ALLOSKIII`,
    description: `${specimen.title} / ${specimen.japaneseName} records`,
  }
}

export default async function SpecimenDetailPage({ params }: Props) {
  const { slug } = await params
  const specimen = getPlantBySlug(slug)

  if (!specimen) {
    notFound()
  }

  const plants = getAllPlants()
  const currentIndex = plants.findIndex((s) => s.slug === specimen.slug)
  const prevSpecimen = currentIndex > 0 ? plants[currentIndex - 1] : null
  const nextSpecimen =
    currentIndex < plants.length - 1 ? plants[currentIndex + 1] : null

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24">
      <NavBar />

      <article className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-border pb-6 mb-12">
          <Link
            href="/archive"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group font-medium"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Archive</span>
          </Link>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            {specimen.category && (
              <span className="uppercase px-2 py-0.5 border border-border">
                {specimen.category}
              </span>
            )}
            <span>No. {specimen.number}</span>
          </div>
        </div>

        {/* Title Block: English & Japanese */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-3">
            {specimen.title}
          </h1>
          <p className="text-xl md:text-2xl font-light text-muted-foreground tracking-wide font-sans">
            {specimen.japaneseName}
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Interactive Image Gallery with Growth Timeline */}
          <div className="lg:col-span-7">
            <PlantImageGallery
              coverSrc={specimen.src}
              title={specimen.title}
              photos={specimen.photos}
            />
          </div>

          {/* Right: Specimen & Future Sales / Inquiries */}
          <div className="lg:col-span-5">
            <SpecimenInquiry availability={specimen.availability} price={specimen.price} />
          </div>
        </div>

        {/* Specimen Pagination */}
        <div className="mt-24 pt-12 border-t border-border grid grid-cols-2 gap-4">
          <div>
            {prevSpecimen ? (
              <Link
                href={`/archive/${prevSpecimen.slug}`}
                className="group flex flex-col items-start gap-1 text-left hover:opacity-80 transition-opacity"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  ← Previous
                </span>
                <span className="font-serif text-lg md:text-xl italic group-hover:-translate-x-1 transition-transform">
                  {prevSpecimen.title}
                </span>
              </Link>
            ) : null}
          </div>

          <div className="text-right">
            {nextSpecimen ? (
              <Link
                href={`/archive/${nextSpecimen.slug}`}
                className="group flex flex-col items-end gap-1 text-right hover:opacity-80 transition-opacity"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Next →
                </span>
                <span className="font-serif text-lg md:text-xl italic group-hover:translate-x-1 transition-transform">
                  {nextSpecimen.title}
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
