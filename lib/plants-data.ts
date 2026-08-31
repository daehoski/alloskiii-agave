export interface PlantPhotoRecord {
  id: string
  date: string // e.g. "2026.09.01"
  src: string
  note?: string
}

export interface PlantItem {
  id: number
  slug: string
  number: string
  title: string
  japaneseName: string
  src: string
  category?: string
  price?: string
  span?: string
  height?: string
  availability?: string
  photos?: PlantPhotoRecord[]
  createdAt?: string
  updatedAt?: string
}

export const CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "titanota", label: "TITANOTA" },
  { id: "oteroi", label: "OTEROI" },
  { id: "horrida", label: "HORRIDA" },
  { id: "utahensis", label: "UTAHENSIS" },
] as const

export const INITIAL_PLANTS: PlantItem[] = [
  {
    id: 1,
    slug: "caesar",
    number: "01",
    title: "Agave Titanota 'Caesar'",
    japaneseName: "シーザー (凱撒)",
    category: "titanota",
    src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
    span: "col-span-12 md:col-span-6 lg:col-span-5",
    height: "h-[450px] lg:h-[500px]",
    availability: "Private Collection (Drop TBA)",
    photos: [
      {
        id: "p1",
        date: "2026.09.01",
        src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
        note: "Initial archive record",
      },
    ],
  },
  {
    id: 2,
    slug: "hades",
    number: "02",
    title: "Agave Titanota 'Hades'",
    japaneseName: "ハデス (黑帝斯)",
    category: "titanota",
    src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
    span: "col-span-12 md:col-span-6 lg:col-span-7",
    height: "h-[450px] lg:h-[500px]",
    availability: "Private Collection (Drop TBA)",
    photos: [
      {
        id: "p2",
        date: "2026.09.01",
        src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: 3,
    slug: "oteroi",
    number: "03",
    title: "Agave Titanota 'Oteroi'",
    japaneseName: "オテロイ",
    category: "oteroi",
    src: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1200&auto=format&fit=crop",
    span: "col-span-12 md:col-span-6 lg:col-span-7",
    height: "h-[480px] lg:h-[540px]",
    availability: "Private Collection (Drop TBA)",
    photos: [
      {
        id: "p3",
        date: "2026.09.01",
        src: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: 4,
    slug: "snaggle-tooth",
    number: "04",
    title: "Agave Titanota 'Snaggle Tooth'",
    japaneseName: "スナグルトゥース (白複輪)",
    category: "titanota",
    src: "https://images.unsplash.com/photo-1534710961216-75c88202f43e?q=80&w=1200&auto=format&fit=crop",
    span: "col-span-12 md:col-span-6 lg:col-span-5",
    height: "h-[480px] lg:h-[540px]",
    availability: "Private Collection (Drop TBA)",
    photos: [
      {
        id: "p4",
        date: "2026.09.01",
        src: "https://images.unsplash.com/photo-1534710961216-75c88202f43e?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
]
