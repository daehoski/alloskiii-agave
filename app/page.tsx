import { NavBar } from "@/components/nav-bar"
import { Hero } from "@/components/hero"
import { ChaoticGallery } from "@/components/chaotic-gallery"
import { Footer } from "@/components/footer"
import { getAllPlants } from "@/lib/plants-db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page() {
  const plants = await getAllPlants()

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <NavBar />
      <Hero />
      <ChaoticGallery items={plants} />
      <Footer />
    </main>
  )
}
