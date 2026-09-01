import { MetadataRoute } from 'next'
import { getAllPlants } from '@/lib/plants-db'
import { getAllPosts } from '@/lib/journal-db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alloskiii-agave.vercel.app'

  const plants = await getAllPlants()
  const posts = await getAllPosts()

  const plantUrls = plants.map((plant) => ({
    url: \\/archive/\\,
    lastModified: new Date(),
  }))

  const postUrls = posts.map((post) => ({
    url: \\/journal/\\,
    lastModified: new Date(post.createdAt || new Date()),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: \\/archive\, lastModified: new Date() },
    { url: \\/journal\, lastModified: new Date() },
    ...plantUrls,
    ...postUrls,
  ]
}
