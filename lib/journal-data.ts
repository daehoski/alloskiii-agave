export interface JournalPost {
  id: number
  slug: string
  title: string
  subtitle?: string
  date: string // e.g. "2026.09.01"
  category: string // e.g. "cultivation", "notes", "announcement"
  coverImage?: string
  content: string
  readTime?: string
  createdAt: string
  updatedAt?: string
}

export const JOURNAL_CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "cultivation", label: "CULTIVATION" },
  { id: "notes", label: "FIELD NOTES" },
  { id: "announcement", label: "NOTICE" },
] as const

export const INITIAL_JOURNAL_POSTS: JournalPost[] = [
  {
    id: 1,
    slug: "soil-mixture-and-mineral-balance",
    title: "The Mineral Ratio for Compact Titanota Rosettes",
    subtitle: "A balanced substrate study focusing on Akadama, Pumice, and Kanuma soil proportions.",
    date: "2026.09.01",
    category: "cultivation",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1200&auto=format&fit=crop",
    content: `Agave Titanota requires an inorganic, fast-draining substrate to develop tight, compact ball-forms without leaf stretching.

### Ideal Substrate Formula
* **Pumice (휴가토/경석)**: 60% — Provides aeration and prevents root compaction.
* **Hard Akadama (삼본선 적옥토)**: 25% — High mineral retention without crumbling.
* **Kanuma Soil (녹소토)**: 10% — Slightly acidic pH balance.
* **Zeolite & Charcoal (훈탄/제올라이트)**: 5% — Root purification and antifungal support.

Strict water control paired with high light intensity (PPFD 900+) ensures that the outer tooth margins develop thick ivory crusts while maintaining a compact core rosette.`,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: 2,
    slug: "led-ppfd-and-airflow-dynamics",
    title: "Light Intensity & Microclimate Dynamics in Indoor Cultivation",
    subtitle: "How 950 µmol/m²/s LED lighting and continuous laminar airflow shape thick marginal teeth.",
    date: "2026.08.20",
    category: "cultivation",
    readTime: "3 min read",
    coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
    content: `When cultivating Agave Titanota indoors, light intensity alone is not sufficient. Without adequate air movement, high PPFD causes leaf burn and stagnant root humidity.

### Key Environmental Targets
1. **Light Intensity**: 850 - 1000 µmol/m²/s (12 hours daily).
2. **Temperature Delta**: 28°C daytime / 20°C nighttime (encourages thick cuticle development).
3. **Airflow**: Constant 0.5 - 1.2 m/s indirect breeze across the canopy.

Maintaining this microclimate prevents root rot and activates the plant's natural defense mechanism, resulting in wider marginal serrations and thicker spines.`,
    createdAt: "2026-08-20T00:00:00.000Z",
  },
]
