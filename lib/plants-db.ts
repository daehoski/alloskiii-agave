import crypto from "crypto"
import { INITIAL_PLANTS, type PlantItem, type PlantPhotoRecord } from "./plants-data"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export type { PlantItem, PlantPhotoRecord }

const PLANTS_FILE = "plants.json"
const TRASH_FILE = "deleted_plants.json"

export function getAllPlants(): PlantItem[] {
  return readStorageJson<PlantItem[]>(PLANTS_FILE, INITIAL_PLANTS)
}

export function getDeletedPlants(): PlantItem[] {
  return readStorageJson<PlantItem[]>(TRASH_FILE, [])
}

function saveDeletedPlants(items: PlantItem[]) {
  writeStorageJson(TRASH_FILE, items)
}

function savePlants(items: PlantItem[]) {
  writeStorageJson(PLANTS_FILE, items)
}

export function getPlantBySlug(slug: string): PlantItem | undefined {
  const plants = getAllPlants()
  return plants.find((p) => p.slug === slug)
}

export function addPlant(data: Omit<PlantItem, "id" | "createdAt">): PlantItem {
  const plants = getAllPlants()
  const nextId = plants.length > 0 ? Math.max(...plants.map((p) => p.id)) + 1 : 1
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".")

  const initialPhotos: PlantPhotoRecord[] = data.photos && data.photos.length > 0
    ? data.photos
    : [
        {
          id: crypto.randomUUID(),
          date: today,
          src: data.src,
          note: "Initial archive record",
        },
      ]

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
  savePlants(plants)
  return newPlant
}

export function updatePlant(id: number, data: Partial<Omit<PlantItem, "id">>): PlantItem | null {
  const plants = getAllPlants()
  const index = plants.findIndex((p) => p.id === id)
  if (index === -1) return null

  plants[index] = {
    ...plants[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  savePlants(plants)
  return plants[index]
}

// Delete a plant and move it to trash for Undo
export function deletePlant(id: number): PlantItem | null {
  const plants = getAllPlants()
  const target = plants.find((p) => p.id === id)
  if (!target) return null

  const filtered = plants.filter((p) => p.id !== id)
  savePlants(filtered)

  // Save to trash backup
  const trash = getDeletedPlants()
  trash.unshift(target)
  saveDeletedPlants(trash)

  return target
}

// Restore a plant from trash (Undo)
export function restorePlant(id?: number): PlantItem | null {
  const trash = getDeletedPlants()
  if (trash.length === 0) return null

  let restored: PlantItem | undefined

  if (id !== undefined) {
    const idx = trash.findIndex((p) => p.id === id)
    if (idx === -1) return null
    restored = trash.splice(idx, 1)[0]
  } else {
    // Restore the most recently deleted
    restored = trash.shift()
  }

  if (!restored) return null

  saveDeletedPlants(trash)

  const plants = getAllPlants()
  if (plants.some((p) => p.id === restored!.id)) {
    restored.id = Math.max(...plants.map((p) => p.id)) + 1
  }

  plants.push(restored)
  savePlants(plants)
  return restored
}

// Move plant position: "top", "up", "down"
export function movePlant(id: number, direction: "top" | "up" | "down"): boolean {
  const plants = getAllPlants()
  const index = plants.findIndex((p) => p.id === id)
  if (index === -1) return false

  if (direction === "top") {
    if (index === 0) return true
    const [target] = plants.splice(index, 1)
    plants.unshift(target)
  } else if (direction === "up") {
    if (index === 0) return true
    const temp = plants[index]
    plants[index] = plants[index - 1]
    plants[index - 1] = temp
  } else if (direction === "down") {
    if (index === plants.length - 1) return true
    const temp = plants[index]
    plants[index] = plants[index + 1]
    plants[index + 1] = temp
  }

  // Update sequential number #01, #02...
  plants.forEach((p, idx) => {
    const num = idx + 1
    p.number = num < 10 ? `0${num}` : `${num}`
  })

  savePlants(plants)
  return true
}

// Add a dated growth photo record to a plant
export function addGrowthPhoto(
  plantId: number,
  date: string,
  src: string,
  note?: string,
  setAsMain: boolean = true
): PlantItem | null {
  const plants = getAllPlants()
  const plant = plants.find((p) => p.id === plantId)
  if (!plant) return null

  if (!plant.photos || plant.photos.length === 0) {
    const initialDate = plant.createdAt ? plant.createdAt.slice(0, 10).replace(/-/g, ".") : "Initial Record"
    plant.photos = [
      {
        id: crypto.randomUUID(),
        date: initialDate,
        src: plant.src,
        note: "Initial archive record",
      },
    ]
  }

  const newPhoto: PlantPhotoRecord = {
    id: crypto.randomUUID(),
    date: date.trim() || new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    src,
    note: note ? note.trim() : undefined,
  }

  plant.photos.unshift(newPhoto)

  if (setAsMain) {
    plant.src = src
  }

  plant.updatedAt = new Date().toISOString()
  savePlants(plants)
  return plant
}

// Delete a photo record from a plant
export function deleteGrowthPhoto(plantId: number, photoId: string): PlantItem | null {
  const plants = getAllPlants()
  const plant = plants.find((p) => p.id === plantId)
  if (!plant || !plant.photos) return null

  plant.photos = plant.photos.filter((photo) => photo.id !== photoId)

  if (plant.photos.length > 0 && !plant.photos.some((p) => p.src === plant.src)) {
    plant.src = plant.photos[0].src
  }

  plant.updatedAt = new Date().toISOString()
  savePlants(plants)
  return plant
}
