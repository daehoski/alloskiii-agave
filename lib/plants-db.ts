import crypto from "crypto"
import { INITIAL_PLANTS, type PlantItem, type PlantPhotoRecord } from "./plants-data"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export type { PlantItem, PlantPhotoRecord }

const PLANTS_FILE = "plants.json"
const TRASH_FILE = "deleted_plants.json"

export async function getAllPlants(): Promise<PlantItem[]> {
  return readStorageJson<PlantItem[]>(PLANTS_FILE, INITIAL_PLANTS)
}

export async function getDeletedPlants(): Promise<PlantItem[]> {
  return readStorageJson<PlantItem[]>(TRASH_FILE, [])
}

export async function getPlantBySlug(slug: string): Promise<PlantItem | undefined> {
  const plants = await getAllPlants()
  return plants.find((p) => p.slug === slug)
}

export async function addPlant(data: Omit<PlantItem, "id" | "createdAt">): Promise<PlantItem> {
  const plants = await getAllPlants()
  const nextId = plants.length > 0 ? Math.max(...plants.map((p) => p.id)) + 1 : 1
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".")

  const initialPhotos: PlantPhotoRecord[] = data.photos && data.photos.length > 0
    ? data.photos
    : [{ id: crypto.randomUUID(), date: today, src: data.src, note: "Initial archive record" }]

  const newPlant: PlantItem = {
    ...data,
    id: nextId,
    photos: initialPhotos,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    span: data.span || (nextId % 2 === 0 ? "col-span-12 md:col-span-6 lg:col-span-7" : "col-span-12 md:col-span-6 lg:col-span-5"),
    height: data.height || "h-[450px] lg:h-[500px]",
  }

  plants.push(newPlant)
  await writeStorageJson(PLANTS_FILE, plants)
  return newPlant
}

export async function updatePlant(id: number, data: Partial<Omit<PlantItem, "id">>): Promise<PlantItem | null> {
  const plants = await getAllPlants()
  const index = plants.findIndex((p) => p.id === id)
  if (index === -1) return null

  plants[index] = { ...plants[index], ...data, updatedAt: new Date().toISOString() }
  await writeStorageJson(PLANTS_FILE, plants)
  return plants[index]
}

export async function deletePlant(id: number): Promise<PlantItem | null> {
  const plants = await getAllPlants()
  const target = plants.find((p) => p.id === id)
  if (!target) return null

  const filtered = plants.filter((p) => p.id !== id)
  await writeStorageJson(PLANTS_FILE, filtered)

  const trash = await getDeletedPlants()
  trash.unshift(target)
  await writeStorageJson(TRASH_FILE, trash)

  return target
}

export async function restorePlant(id?: number): Promise<PlantItem | null> {
  const trash = await getDeletedPlants()
  if (trash.length === 0) return null

  let restored: PlantItem | undefined
  if (id !== undefined) {
    const idx = trash.findIndex((p) => p.id === id)
    if (idx === -1) return null
    restored = trash.splice(idx, 1)[0]
  } else {
    restored = trash.shift()
  }
  if (!restored) return null

  await writeStorageJson(TRASH_FILE, trash)

  const plants = await getAllPlants()
  if (plants.some((p) => p.id === restored!.id)) {
    restored.id = Math.max(...plants.map((p) => p.id)) + 1
  }
  plants.push(restored)
  await writeStorageJson(PLANTS_FILE, plants)
  return restored
}

export async function movePlant(id: number, direction: "top" | "up" | "down"): Promise<boolean> {
  const plants = await getAllPlants()
  const index = plants.findIndex((p) => p.id === id)
  if (index === -1) return false

  if (direction === "top") {
    if (index === 0) return true
    const [target] = plants.splice(index, 1)
    plants.unshift(target)
  } else if (direction === "up") {
    if (index === 0) return true
    ;[plants[index], plants[index - 1]] = [plants[index - 1], plants[index]]
  } else if (direction === "down") {
    if (index === plants.length - 1) return true
    ;[plants[index], plants[index + 1]] = [plants[index + 1], plants[index]]
  }

  plants.forEach((p, idx) => {
    const num = idx + 1
    p.number = num < 10 ? `0${num}` : `${num}`
  })

  await writeStorageJson(PLANTS_FILE, plants)
  return true
}

export async function addGrowthPhoto(
  plantId: number, date: string, src: string, note?: string, setAsMain: boolean = true
): Promise<PlantItem | null> {
  const plants = await getAllPlants()
  const plant = plants.find((p) => p.id === plantId)
  if (!plant) return null

  if (!plant.photos || plant.photos.length === 0) {
    const initialDate = plant.createdAt ? plant.createdAt.slice(0, 10).replace(/-/g, ".") : "Initial Record"
    plant.photos = [{ id: crypto.randomUUID(), date: initialDate, src: plant.src, note: "Initial archive record" }]
  }

  plant.photos.unshift({
    id: crypto.randomUUID(),
    date: date.trim() || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    src,
    note: note ? note.trim() : undefined,
  })

  if (setAsMain) plant.src = src
  plant.updatedAt = new Date().toISOString()
  await writeStorageJson(PLANTS_FILE, plants)
  return plant
}

export async function deleteGrowthPhoto(plantId: number, photoId: string): Promise<PlantItem | null> {
  const plants = await getAllPlants()
  const plant = plants.find((p) => p.id === plantId)
  if (!plant || !plant.photos) return null

  plant.photos = plant.photos.filter((photo) => photo.id !== photoId)
  if (plant.photos.length > 0 && !plant.photos.some((p) => p.src === plant.src)) {
    plant.src = plant.photos[0].src
  }
  plant.updatedAt = new Date().toISOString()
  await writeStorageJson(PLANTS_FILE, plants)
  return plant
}
