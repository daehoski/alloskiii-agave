"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { CATEGORIES, type PlantItem, type PlantPhotoRecord } from "@/lib/plants-data"
import { JOURNAL_CATEGORIES, type JournalPost } from "@/lib/journal-data"
import type { AnalyticsSummary } from "@/lib/analytics-db"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role?: string } | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Main Section Tab: plants | journal | analytics
  const [adminTab, setAdminTab] = useState<"plants" | "journal" | "analytics">("plants")

  // Plants State
  const [plants, setPlants] = useState<PlantItem[]>([])
  const [deletedPlants, setDeletedPlants] = useState<PlantItem[]>([])
  const [loadingPlants, setLoadingPlants] = useState(true)

  // Journal State
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([])
  const [loadingJournal, setLoadingJournal] = useState(true)
  const [editingJournalId, setEditingJournalId] = useState<number | null>(null)

  // Analytics State
  const [stats, setStats] = useState<AnalyticsSummary | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Journal Form State
  const [journalTitle, setJournalTitle] = useState("")
  const [journalSubtitle, setJournalSubtitle] = useState("")
  const [journalSlug, setJournalSlug] = useState("")
  const [journalDate, setJournalDate] = useState(new Date().toISOString().slice(0, 10).replace(/-/g, "."))
  const [journalCategory, setJournalCategory] = useState("cultivation")
  const [journalCover, setJournalCover] = useState("")
  const [journalContent, setJournalContent] = useState("")
  const [journalReadTime, setJournalReadTime] = useState("3 min read")
  const [uploadingJournalCover, setUploadingJournalCover] = useState(false)
  const [submittingJournal, setSubmittingJournal] = useState(false)

  // Modals & Panels
  const [showTrashModal, setShowTrashModal] = useState(false)
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null)

  // Growth Photo Management Modal State
  const [growthModalPlant, setGrowthModalPlant] = useState<PlantItem | null>(null)
  const [growthDate, setGrowthDate] = useState(new Date().toISOString().slice(0, 10).replace(/-/g, "."))
  const [growthPhotoUrl, setGrowthPhotoUrl] = useState("")
  const [growthNote, setGrowthNote] = useState("")
  const [growthSetMain, setGrowthSetMain] = useState(true)
  const [uploadingGrowthPhoto, setUploadingGrowthPhoto] = useState(false)
  const [submittingGrowthPhoto, setSubmittingGrowthPhoto] = useState(false)

  // Plant Form State
  const [title, setTitle] = useState("")
  const [japaneseName, setJapaneseName] = useState("")
  const [slug, setSlug] = useState("")
  const [number, setNumber] = useState("")
  const [category, setCategory] = useState("titanota")
  const [price, setPrice] = useState("")
  const [availability, setAvailability] = useState("Private Collection (Drop TBA)")
  const [imageUrl, setImageUrl] = useState("")

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "undo"
    message: string
    deletedId?: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const growthFileInputRef = useRef<HTMLInputElement>(null)
  const journalFileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const journalFormRef = useRef<HTMLDivElement>(null)

  // Auth verification
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          router.push("/sign-in?next=/admin")
          return
        }
        const data = await res.json()
        if (!data.authenticated) {
          router.push("/sign-in?next=/admin")
          return
        }
        setCurrentUser(data.user)
      } catch (err) {
        router.push("/sign-in?next=/admin")
      } finally {
        setLoadingUser(false)
      }
    }
    checkAuth()
  }, [router])

  // Load plants and trash
  const fetchPlants = async () => {
    try {
      setLoadingPlants(true)
      const res = await fetch("/api/plants")
      const data = await res.json()
      if (data.plants) {
        setPlants(data.plants)
        if (!editingPlantId) {
          const maxNum = data.plants.length > 0 ? data.plants.length + 1 : 1
          setNumber(maxNum < 10 ? `0${maxNum}` : `${maxNum}`)
        }
        if (growthModalPlant) {
          const updated = data.plants.find((p: PlantItem) => p.id === growthModalPlant.id)
          if (updated) setGrowthModalPlant(updated)
        }
      }

      const trashRes = await fetch("/api/plants/restore")
      const trashData = await trashRes.json()
      if (trashData.deletedPlants) {
        setDeletedPlants(trashData.deletedPlants)
      }
    } catch (err) {
      console.error("Failed to load plants:", err)
    } finally {
      setLoadingPlants(false)
    }
  }

  // Load journal posts
  const fetchJournal = async () => {
    try {
      setLoadingJournal(true)
      const res = await fetch("/api/journal")
      const data = await res.json()
      if (data.posts) {
        setJournalPosts(data.posts)
      }
    } catch (err) {
      console.error("Failed to load journal:", err)
    } finally {
      setLoadingJournal(false)
    }
  }

  // Load analytics stats
  const fetchAnalytics = async () => {
    try {
      setLoadingStats(true)
      const res = await fetch("/api/analytics/stats")
      const data = await res.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchPlants()
      fetchJournal()
      fetchAnalytics()
    }
  }, [currentUser])

  // Refresh stats when switching to analytics tab
  useEffect(() => {
    if (adminTab === "analytics" && currentUser?.role === "ADMIN") {
      fetchAnalytics()
    }
  }, [adminTab, currentUser])

  // Restore Plant (Undo)
  const handleRestorePlant = async (id?: number) => {
    try {
      const res = await fetch("/api/plants/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to restore plant")
      }

      setFeedback({
        type: "success",
        message: `✓ Restored '${data.plant?.title || "plant"}' successfully!`,
      })
      fetchPlants()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Move Plant Order
  const handleMovePlant = async (id: number, direction: "top" | "up" | "down", plantTitle: string) => {
    try {
      const res = await fetch("/api/plants/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      })

      if (!res.ok) {
        throw new Error("Failed to reorder plants")
      }

      setFeedback({
        type: "success",
        message: direction === "top" ? `Moved '${plantTitle}' to #01 (Top)` : `Updated order of '${plantTitle}'`,
      })
      fetchPlants()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Start editing a plant
  const startEdit = (plant: PlantItem) => {
    setEditingPlantId(plant.id)
    setTitle(plant.title)
    setJapaneseName(plant.japaneseName || "")
    setSlug(plant.slug)
    setNumber(plant.number)
    setCategory(plant.category || "titanota")
    setPrice(plant.price || "")
    setAvailability(plant.availability || "Private Collection (Drop TBA)")
    setImageUrl(plant.src)
    setFeedback(null)

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Cancel edit plant
  const cancelEdit = () => {
    setEditingPlantId(null)
    setTitle("")
    setJapaneseName("")
    setSlug("")
    setImageUrl("")
    setCategory("titanota")
    setPrice("")
    setAvailability("Private Collection (Drop TBA)")
    const maxNum = plants.length > 0 ? plants.length + 1 : 1
    setNumber(maxNum < 10 ? `0${maxNum}` : `${maxNum}`)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingPlantId && (!slug || slug === "")) {
      const generated = val
        .toLowerCase()
        .replace(/agave titanota/g, "")
        .replace(/agave/g, "")
        .replace(/['"]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      setSlug(generated || val.toLowerCase().replace(/[^a-z0-9]/g, "-"))
    }
  }

  // Auto-generate journal slug
  const handleJournalTitleChange = (val: string) => {
    setJournalTitle(val)
    if (!editingJournalId && (!journalSlug || journalSlug === "")) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-가-힣]/g, "")
      setJournalSlug(generated)
    }
  }

  // Handle Main Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setImageUrl(data.url)
      setFeedback({ type: "success", message: "New image uploaded successfully." })
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to upload image" })
    } finally {
      setUploading(false)
    }
  }

  // Handle Journal Cover Upload
  const handleJournalCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingJournalCover(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setJournalCover(data.url)
    } catch (err: any) {
      alert(err.message || "Failed to upload cover image")
    } finally {
      setUploadingJournalCover(false)
    }
  }

  // Handle Growth Photo Upload
  const handleGrowthFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingGrowthPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setGrowthPhotoUrl(data.url)
    } catch (err: any) {
      alert(err.message || "Failed to upload photo")
    } finally {
      setUploadingGrowthPhoto(false)
    }
  }

  // Add Growth Photo to Plant
  const handleAddGrowthPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!growthModalPlant || !growthPhotoUrl) return

    setSubmittingGrowthPhoto(true)

    try {
      const res = await fetch(`/api/plants/${growthModalPlant.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: growthDate,
          src: growthPhotoUrl,
          note: growthNote,
          setAsMain: growthSetMain,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to add growth photo")
      }

      setGrowthPhotoUrl("")
      setGrowthNote("")
      if (growthFileInputRef.current) growthFileInputRef.current.value = ""
      setFeedback({
        type: "success",
        message: `Added new growth photo (${growthDate}) for ${growthModalPlant.title}`,
      })
      fetchPlants()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmittingGrowthPhoto(false)
    }
  }

  // Delete Growth Photo
  const handleDeleteGrowthPhoto = async (photoId: string) => {
    if (!growthModalPlant) return
    if (!confirm("Are you sure you want to delete this photo record?")) return

    try {
      const res = await fetch(`/api/plants/${growthModalPlant.id}/photos?photoId=${photoId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete photo record")
      fetchPlants()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Create or Update Plant Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug || !imageUrl) {
      setFeedback({ type: "error", message: "Plant title, slug, and image are required." })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      if (editingPlantId) {
        const res = await fetch(`/api/plants/${editingPlantId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            japaneseName,
            slug,
            number: number || "01",
            src: imageUrl,
            category: category || "titanota",
            price: price.trim(),
            availability,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to update plant")

        setFeedback({ type: "success", message: `Successfully updated '${title}'` })
        cancelEdit()
      } else {
        const res = await fetch("/api/plants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            japaneseName,
            slug,
            number: number || "01",
            src: imageUrl,
            category: category || "titanota",
            price: price.trim(),
            availability,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to register plant")

        setFeedback({ type: "success", message: `Successfully registered '${title}'` })
        setTitle("")
        setJapaneseName("")
        setSlug("")
        setImageUrl("")
        setPrice("")
        if (fileInputRef.current) fileInputRef.current.value = ""
      }

      fetchPlants()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Plant
  const handleDeletePlant = async (id: number, plantTitle: string) => {
    if (!confirm(`Are you sure you want to delete '${plantTitle}'? (You can Undo it anytime)`)) return

    try {
      const res = await fetch(`/api/plants/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete plant")

      setFeedback({
        type: "undo",
        message: `Deleted '${plantTitle}'.`,
        deletedId: id,
      })
      if (editingPlantId === id) cancelEdit()
      if (growthModalPlant?.id === id) setGrowthModalPlant(null)
      fetchPlants()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Journal Functions
  const startEditJournal = (post: JournalPost) => {
    setEditingJournalId(post.id)
    setJournalTitle(post.title)
    setJournalSubtitle(post.subtitle || "")
    setJournalSlug(post.slug)
    setJournalDate(post.date)
    setJournalCategory(post.category)
    setJournalCover(post.coverImage || "")
    setJournalContent(post.content)
    setJournalReadTime(post.readTime || "3 min read")

    if (journalFormRef.current) {
      journalFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const cancelEditJournal = () => {
    setEditingJournalId(null)
    setJournalTitle("")
    setJournalSubtitle("")
    setJournalSlug("")
    setJournalCover("")
    setJournalContent("")
    setJournalDate(new Date().toISOString().slice(0, 10).replace(/-/g, "."))
    setJournalCategory("cultivation")
    setJournalReadTime("3 min read")
    if (journalFileInputRef.current) journalFileInputRef.current.value = ""
  }

  const handleSubmitJournal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!journalTitle || !journalSlug || !journalContent) {
      setFeedback({ type: "error", message: "Title, slug, and content are required for journal." })
      return
    }

    setSubmittingJournal(true)
    setFeedback(null)

    try {
      if (editingJournalId) {
        const res = await fetch(`/api/journal/${editingJournalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: journalTitle,
            subtitle: journalSubtitle,
            slug: journalSlug,
            date: journalDate,
            category: journalCategory,
            coverImage: journalCover,
            content: journalContent,
            readTime: journalReadTime,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to update journal post")

        setFeedback({ type: "success", message: `Updated journal article '${journalTitle}'` })
        cancelEditJournal()
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: journalTitle,
            subtitle: journalSubtitle,
            slug: journalSlug,
            date: journalDate,
            category: journalCategory,
            coverImage: journalCover,
            content: journalContent,
            readTime: journalReadTime,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to publish journal post")

        setFeedback({ type: "success", message: `Published journal article '${journalTitle}'` })
        cancelEditJournal()
      }

      fetchJournal()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setSubmittingJournal(false)
    }
  }

  const handleDeleteJournal = async (id: number, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete article '${postTitle}'?`)) return

    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete post")

      setFeedback({ type: "success", message: `Deleted journal article '${postTitle}'` })
      if (editingJournalId === id) cancelEditJournal()
      fetchJournal()
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Sign out
  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" })
    router.push("/sign-in")
    router.refresh()
  }

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">
          Authenticating administrator access...
        </div>
      </main>
    )
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative pt-20">
        <NavBar />
        <div className="w-full max-w-lg border border-red-500/40 p-8 md:p-10 bg-red-500/5 backdrop-blur-md text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-red-400 block mb-3">
            [ 403 ACCESS RESTRICTED ]
          </span>
          <h1 className="font-serif text-3xl italic mb-3">Administrator Access Only</h1>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Current account (<span className="text-foreground font-mono">{currentUser?.email}</span>) is a standard member account.
            Only <span className="text-foreground font-mono font-medium">alloskiii8@gmail.com</span> is granted administrator privileges.
          </p>

          <div className="flex justify-center gap-4 text-xs font-mono">
            <Link
              href="/archive"
              className="px-4 py-2.5 bg-foreground text-background font-semibold uppercase tracking-wider"
            >
              Go to Archive →
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 border border-border hover:bg-secondary/40 uppercase tracking-wider cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24 pb-20">
      <NavBar />

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Top Header */}
        <div className="border-b border-border pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                [ ADMIN CONSOLE ]
              </span>
              <span className="text-xs font-mono text-emerald-400">
                — {currentUser?.email} (ADMIN)
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight">
              ALLOSKIII MANAGEMENT
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Trash Button */}
            {adminTab === "plants" && (
              <button
                type="button"
                onClick={() => setShowTrashModal(true)}
                className="px-3.5 py-2 border border-border bg-secondary/10 hover:bg-secondary/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>🗑️ 휴지통 / 복구</span>
                <span className="px-1.5 py-0.2 bg-background border border-border text-[10px]">
                  {deletedPlants.length}
                </span>
              </button>
            )}

            <Link
              href="/archive"
              className="px-3.5 py-2 border border-border hover:bg-secondary/20 transition-colors uppercase tracking-wider"
            >
              Public Archive ↗
            </Link>
            <Link
              href="/journal"
              className="px-3.5 py-2 border border-border hover:bg-secondary/20 transition-colors uppercase tracking-wider"
            >
              Public Journal ↗
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Switcher: Plants vs Journal vs Analytics */}
        <div className="flex flex-wrap gap-3 border-b border-border mb-10 pb-4">
          <button
            type="button"
            onClick={() => setAdminTab("plants")}
            className={`px-5 py-2.5 font-serif text-base md:text-lg italic transition-all cursor-pointer border ${
              adminTab === "plants"
                ? "border-foreground bg-foreground text-background font-semibold"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            🪴 식물 개체 관리 ({plants.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("journal")}
            className={`px-5 py-2.5 font-serif text-base md:text-lg italic transition-all cursor-pointer border ${
              adminTab === "journal"
                ? "border-foreground bg-foreground text-background font-semibold"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            📝 저널 글쓰기 ({journalPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("analytics")}
            className={`px-5 py-2.5 font-serif text-base md:text-lg italic transition-all cursor-pointer border flex items-center gap-2 ${
              adminTab === "analytics"
                ? "border-emerald-500 bg-emerald-500 text-black font-semibold"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>📊 방문자 모니터링 (실시간)</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-8 p-4 border font-mono text-xs flex justify-between items-center ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : feedback.type === "undo"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <span>{feedback.message}</span>
              {feedback.type === "undo" && (
                <button
                  type="button"
                  onClick={() => handleRestorePlant(feedback.deletedId)}
                  className="px-3 py-1 bg-amber-400 text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  ↩️ 삭제 되돌리기 (Undo)
                </button>
              )}
            </div>
            <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground ml-4">
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: PLANTS MANAGEMENT */}
        {adminTab === "plants" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form */}
            <div
              ref={formRef}
              className={`lg:col-span-5 border p-6 md:p-8 backdrop-blur-md transition-colors ${
                editingPlantId
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-secondary/10"
              }`}
            >
              <div className="border-b border-border pb-4 mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest font-mono block mb-1 text-primary">
                    {editingPlantId ? "[ EDITING MODE / 개체 수정 ]" : "[ NEW ENTRY / 신규 등록 ]"}
                  </span>
                  <h2 className="font-serif text-2xl italic">
                    {editingPlantId ? `Edit: ${title}` : "Register New Plant"}
                  </h2>
                </div>
                {editingPlantId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 cursor-pointer"
                  >
                    Cancel Edit ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitForm} className="flex flex-col gap-5 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Plant Name (English) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Agave Titanota 'Caesar'"
                    required
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Japanese Cultivar Name
                  </label>
                  <input
                    type="text"
                    value={japaneseName}
                    onChange={(e) => setJapaneseName(e.target.value)}
                    placeholder="e.g. シーザー (凱撒)"
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Category (품종 분류)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                          category.toLowerCase() === cat.id
                            ? "bg-foreground text-background font-semibold"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="titanota, oteroi, horrida, utahensis..."
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors font-mono"
                  />
                </div>

                {/* Price Field */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Price (분양 가격 — <span className="text-primary/80">비워두면 숨김</span>)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. ₩150,000 또는 150,000원"
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                      Slug (URL 주소명) *
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. caesar"
                      required
                      className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                      Number (번호)
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="e.g. 05"
                      className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Availability Status (분양 / 소장 상태)
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g. Private Collection (Drop TBA)"
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAvailability("Private Collection (Drop TBA)")}
                      className="text-[10px] font-mono border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                    >
                      + 개인 소장 (Drop TBA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailability("Available for Purchase")}
                      className="text-[10px] font-mono border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                    >
                      + 분양 가능 (Available)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailability("Sold Out")}
                      className="text-[10px] font-mono border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                    >
                      + 분양 완료 (Sold Out)
                    </button>
                  </div>
                </div>

                {/* Cover Photo */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Cover Photo (대표 사진) *
                  </label>
                  <div className="border border-dashed border-border p-4 bg-secondary/20 text-center flex flex-col items-center justify-center gap-3">
                    {imageUrl ? (
                      <div className="relative w-full h-44 overflow-hidden border border-border group">
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-foreground">
                            Click below to change photo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-muted-foreground">
                        <p className="text-xs mb-1">Select or drop a photo here</p>
                        <p className="text-[10px] font-mono text-muted-foreground/60">
                          Supports JPG, PNG, WEBP
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.heic,.HEIC"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="text-[11px] font-mono text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:bg-background file:text-foreground file:text-xs file:uppercase file:cursor-pointer hover:file:bg-secondary/40"
                    />

                    {uploading && (
                      <span className="text-[10px] font-mono text-primary animate-pulse">
                        Uploading to server...
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  {editingPlantId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-1/3 py-3.5 border border-border text-foreground text-xs font-semibold uppercase tracking-widest hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || uploading || !imageUrl}
                    className={`py-3.5 bg-foreground text-background text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer ${
                      editingPlantId ? "w-2/3" : "w-full"
                    }`}
                  >
                    {submitting
                      ? "Saving..."
                      : editingPlantId
                      ? "✓ Update Plant Entry"
                      : "+ Register Plant Entry"}
                  </button>
                </div>
              </form>
            </div>

            {/* Plants List */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="border-b border-border pb-4 flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    [ ACTIVE INVENTORY & REORDER ]
                  </span>
                  <h2 className="font-serif text-2xl italic">
                    Registered Plants ({plants.length})
                  </h2>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  * [🔝 1번] 버튼으로 1번 개체로 이동할 수 있습니다.
                </p>
              </div>

              {loadingPlants ? (
                <div className="p-8 border border-border text-center text-xs font-mono text-muted-foreground animate-pulse">
                  Loading plants database...
                </div>
              ) : plants.length === 0 ? (
                <div className="p-8 border border-border text-center text-xs font-mono text-muted-foreground">
                  No plants registered yet. Add your first plant using the form.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {plants.map((p, index) => {
                    const isCurrentEditing = editingPlantId === p.id
                    const photoCount = p.photos && p.photos.length > 0 ? p.photos.length : 1

                    return (
                      <div
                        key={p.id}
                        className={`border p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isCurrentEditing
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/10 hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 shrink-0 border border-border overflow-hidden bg-secondary/30">
                            <Image src={p.src} alt={p.title} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-mono font-semibold text-primary">
                                #{p.number}
                              </span>
                              <h3 className="font-serif text-base font-medium">{p.title}</h3>
                              {p.category && (
                                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 border border-border text-muted-foreground">
                                  {p.category}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-light mb-1">
                              {p.japaneseName || "—"}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-primary/70 uppercase">
                                {p.availability || "Private"}
                              </span>
                              {p.price && (
                                <span className="text-[10px] font-mono font-semibold text-foreground border-l border-border pl-3">
                                  {p.price}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setGrowthModalPlant(p)}
                                className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              >
                                📷 성장 사진 ({photoCount}장) +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 self-end md:self-center">
                          <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMovePlant(p.id, "top", p.title)}
                                title="1번으로 이동 (Top)"
                                className="px-2 py-1 border border-primary/50 text-[10px] font-mono text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                🔝 1번
                              </button>
                            )}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMovePlant(p.id, "up", p.title)}
                                title="위로 이동"
                                className="px-2 py-1 border border-border text-[10px] font-mono hover:bg-secondary/40 transition-colors cursor-pointer"
                              >
                                ▲
                              </button>
                            )}
                            {index < plants.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMovePlant(p.id, "down", p.title)}
                                title="아래로 이동"
                                className="px-2 py-1 border border-border text-[10px] font-mono hover:bg-secondary/40 transition-colors cursor-pointer"
                              >
                                ▼
                              </button>
                            )}
                          </div>

                          <Link
                            href={`/archive/${p.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 border border-border text-[11px] font-mono hover:bg-secondary/40 transition-colors"
                          >
                            View ↗
                          </Link>
                          <button
                            onClick={() => startEdit(p)}
                            className="px-2.5 py-1 border border-primary/50 text-primary text-[11px] font-mono hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlant(p.id, p.title)}
                            className="px-2.5 py-1 border border-red-500/40 text-red-400 text-[11px] font-mono hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: JOURNAL WRITING & MANAGEMENT */}
        {adminTab === "journal" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div
              ref={journalFormRef}
              className={`lg:col-span-5 border p-6 md:p-8 backdrop-blur-md transition-colors ${
                editingJournalId
                  ? "border-emerald-500/60 bg-emerald-500/5"
                  : "border-border bg-secondary/10"
              }`}
            >
              <div className="border-b border-border pb-4 mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest font-mono block mb-1 text-emerald-400">
                    {editingJournalId ? "[ EDITING ARTICLE / 저널 수정 ]" : "[ NEW ARTICLE / 새 글 작성 ]"}
                  </span>
                  <h2 className="font-serif text-2xl italic">
                    {editingJournalId ? `Edit: ${journalTitle}` : "Write Journal Article"}
                  </h2>
                </div>
                {editingJournalId && (
                  <button
                    type="button"
                    onClick={cancelEditJournal}
                    className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 cursor-pointer"
                  >
                    Cancel Edit ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitJournal} className="flex flex-col gap-5 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Article Title (글 제목) *
                  </label>
                  <input
                    type="text"
                    value={journalTitle}
                    onChange={(e) => handleJournalTitleChange(e.target.value)}
                    placeholder="e.g. The Mineral Ratio for Compact Titanota Rosettes"
                    required
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Subtitle / Summary (한 줄 요약/부제목)
                  </label>
                  <input
                    type="text"
                    value={journalSubtitle}
                    onChange={(e) => setJournalSubtitle(e.target.value)}
                    placeholder="e.g. A balanced substrate study focusing on Akadama, Pumice, and Kanuma soil proportions."
                    className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                      Slug (URL 주소명) *
                    </label>
                    <input
                      type="text"
                      value={journalSlug}
                      onChange={(e) => setJournalSlug(e.target.value)}
                      placeholder="e.g. soil-mixture-guide"
                      required
                      className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                      Published Date (날짜)
                    </label>
                    <input
                      type="text"
                      value={journalDate}
                      onChange={(e) => setJournalDate(e.target.value)}
                      placeholder="e.g. 2026.09.01"
                      className="w-full bg-secondary/20 border border-border px-3.5 py-2.5 text-foreground font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Category (분류 태그)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {JOURNAL_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setJournalCategory(cat.id)}
                        className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                          journalCategory.toLowerCase() === cat.id
                            ? "bg-foreground text-background font-semibold"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Cover Photo (커버 대표 사진)
                  </label>
                  <div className="border border-dashed border-border p-4 bg-secondary/20 text-center flex flex-col items-center justify-center gap-3">
                    {journalCover ? (
                      <div className="relative w-full h-36 overflow-hidden border border-border group">
                        <Image src={journalCover} alt="Journal Cover" fill className="object-cover" />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-foreground">
                            Click below to change photo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-muted-foreground">
                        <p className="text-xs mb-1">Select cover photo for this article</p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={journalFileInputRef}
                      accept="image/*,.heic,.HEIC"
                      onChange={handleJournalCoverUpload}
                      disabled={uploadingJournalCover}
                      className="text-[11px] font-mono text-muted-foreground file:mr-3 file:py-1 file:px-3 file:border file:border-border file:bg-background file:text-foreground file:text-xs file:cursor-pointer"
                    />

                    {uploadingJournalCover && (
                      <span className="text-[10px] font-mono text-primary animate-pulse">
                        Uploading cover...
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    Article Body Content (본문 에세이 / 마크다운 지원) *
                  </label>
                  <textarea
                    rows={12}
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write your cultivation notes, tips, substrate recipes, or notices here..."
                    required
                    className="w-full bg-secondary/20 border border-border p-3.5 text-foreground leading-relaxed font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors font-light"
                  />
                </div>

                <div className="flex gap-3 mt-3">
                  {editingJournalId && (
                    <button
                      type="button"
                      onClick={cancelEditJournal}
                      className="w-1/3 py-3.5 border border-border text-foreground text-xs font-semibold uppercase tracking-widest hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submittingJournal || uploadingJournalCover || !journalTitle || !journalContent}
                    className={`py-3.5 bg-foreground text-background text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer ${
                      editingJournalId ? "w-2/3" : "w-full"
                    }`}
                  >
                    {submittingJournal
                      ? "Publishing..."
                      : editingJournalId
                      ? "✓ Update Article"
                      : "✍️ Publish Journal Article"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="border-b border-border pb-4 flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-1">
                    [ PUBLISHED ESSAYS & NOTES ]
                  </span>
                  <h2 className="font-serif text-2xl italic">
                    Journal Articles ({journalPosts.length})
                  </h2>
                </div>
              </div>

              {loadingJournal ? (
                <div className="p-8 border border-border text-center text-xs font-mono text-muted-foreground animate-pulse">
                  Loading journal articles...
                </div>
              ) : journalPosts.length === 0 ? (
                <div className="p-8 border border-border text-center text-xs font-mono text-muted-foreground">
                  No articles published yet. Write your first article using the form.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {journalPosts.map((post) => {
                    const isCurrentEditing = editingJournalId === post.id

                    return (
                      <div
                        key={post.id}
                        className={`border p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isCurrentEditing
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border bg-secondary/10 hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {post.coverImage && (
                            <div className="relative w-16 h-16 shrink-0 border border-border overflow-hidden bg-secondary/30">
                              <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {post.date}
                              </span>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 border border-border text-muted-foreground">
                                {post.category}
                              </span>
                            </div>
                            <h3 className="font-serif text-base font-medium">{post.title}</h3>
                            {post.subtitle && (
                              <p className="text-xs text-muted-foreground font-light line-clamp-1 mt-0.5">
                                {post.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <Link
                            href={`/journal/${post.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 border border-border text-[11px] font-mono hover:bg-secondary/40 transition-colors"
                          >
                            Read ↗
                          </Link>
                          <button
                            onClick={() => startEditJournal(post)}
                            className="px-2.5 py-1 border border-emerald-500/50 text-emerald-400 text-[11px] font-mono hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(post.id, post.title)}
                            className="px-2.5 py-1 border border-red-500/40 text-red-400 text-[11px] font-mono hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME TRAFFIC & VISITORS MONITORING */}
        {adminTab === "analytics" && (
          <div className="flex flex-col gap-8">
            {/* Header with Live Refresh Button */}
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono block mb-1">
                  [ LIVE TRAFFIC & VISITOR ANALYTICS ]
                </span>
                <h2 className="font-serif text-2xl md:text-3xl italic">
                  실시간 방문자 & 인스타 유입 통계
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchAnalytics}
                disabled={loadingStats}
                className="px-4 py-2 border border-emerald-500/50 text-emerald-400 text-xs font-mono uppercase tracking-wider hover:bg-emerald-500/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>🔄 실시간 새로고침</span>
                {loadingStats && <span className="animate-spin">⟳</span>}
              </button>
            </div>

            {/* 4 Stat Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="border border-border bg-secondary/10 p-5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-2">
                  오늘 방문자 수 (Unique)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl md:text-5xl font-medium text-foreground">
                    {stats?.todayVisitors ?? 0}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">명</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>실시간 집계 중</span>
                </div>
              </div>

              <div className="border border-border bg-secondary/10 p-5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-2">
                  오늘 페이지뷰 (Views)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl md:text-5xl font-medium text-foreground">
                    {stats?.todayPageViews ?? 0}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">회 (누적 {stats?.totalPageViews ?? 0})</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground mt-3">
                  개체 및 저널 탐색 횟수
                </span>
              </div>

              <div className="border border-pink-500/30 bg-pink-500/5 p-5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 block mb-2">
                  인스타 스토리 유입 (Instagram)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl md:text-5xl font-medium text-pink-300">
                    {stats?.instagramReferrals ?? 0}
                  </span>
                  <span className="text-xs font-mono text-pink-400">명</span>
                </div>
                <span className="text-[10px] font-mono text-pink-400/80 mt-3">
                  인스타그램 프로필/스토리 링크
                </span>
              </div>

              <div className="border border-border bg-secondary/10 p-5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-2">
                  모바일 접속 비율 (Mobile)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl md:text-5xl font-medium text-foreground">
                    {stats?.mobilePercentage ?? 100}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground mt-3">
                  스마트폰 접속자 비중
                </span>
              </div>
            </div>

            {/* Bottom 2 Columns: Top Specimen Ranking + Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Popular Specimen Ranking */}
              <div className="lg:col-span-6 border border-border bg-secondary/10 p-6 flex flex-col gap-5">
                <div className="flex justify-between items-baseline border-b border-border pb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
                    🏆 실시간 인기 개체 TOP 순위
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">조회수 기준</span>
                </div>

                {!stats?.topPlants || stats.topPlants.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-muted-foreground">
                    아직 개체 조회 데이터가 쌓이지 않았습니다. (링크를 타고 방문하면 바로 뜹니다!)
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.topPlants.map((plant, idx) => (
                      <div key={plant.slug} className="border border-border/60 p-3 bg-secondary/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-emerald-400 w-6">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-serif text-base font-medium">{plant.title}</h4>
                            <span className="text-[10px] font-mono text-muted-foreground">/archive/{plant.slug}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-semibold text-foreground">{plant.views}</span>
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Referrers */}
                <div className="border-t border-border pt-4 mt-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">
                    유입 경로 비율 (Referrers)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {stats?.referrers.map((ref) => (
                      <div key={ref.source} className="border border-border px-3 py-1.5 bg-background text-xs font-mono flex items-center gap-2">
                        <span className="text-muted-foreground">{ref.source}:</span>
                        <span className="text-foreground font-bold">{ref.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Live Activity Stream */}
              <div className="lg:col-span-6 border border-border bg-secondary/10 p-6 flex flex-col gap-5">
                <div className="flex justify-between items-baseline border-b border-border pb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>실시간 방문자 로그 (Live Feed)</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">최근 접속 10건</span>
                </div>

                {!stats?.recentEvents || stats.recentEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-muted-foreground">
                    방문자 접속 대기 중...
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.recentEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="border border-border/50 p-2.5 bg-background/50 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">{event.time}</span>
                          <span className="text-foreground font-medium truncate max-w-[200px]">{event.path}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 border border-border bg-secondary/30 text-muted-foreground">
                            {event.referrer}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {event.device === "mobile" ? "📱" : "💻"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Growth Photo Management Modal */}
      {growthModalPlant && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl border border-border bg-background p-6 md:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                  [ GROWTH RECORD & TIMELINE ]
                </span>
                <h3 className="font-serif text-2xl italic">
                  {growthModalPlant.title} 성장 사진 기록
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  몇 달마다 찍은 사진을 날짜별로 등록하면 개체 페이지에 성장 타임라인으로 기록됩니다. (이전 사진들은 100% 보존됩니다)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGrowthModalPlant(null)}
                className="text-muted-foreground hover:text-foreground font-mono text-sm border border-border px-2 py-1 cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            <form
              onSubmit={handleAddGrowthPhotoSubmit}
              className="border border-border p-4 bg-secondary/10 flex flex-col gap-4 text-xs"
            >
              <div className="font-mono text-[11px] uppercase tracking-wider text-foreground font-semibold">
                + 새 날짜의 성장 사진 추가 (Add Dated Photo)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-1">
                    촬영 날짜 (Date) *
                  </label>
                  <input
                    type="text"
                    value={growthDate}
                    onChange={(e) => setGrowthDate(e.target.value)}
                    placeholder="e.g. 2026.09.01"
                    required
                    className="w-full bg-secondary/20 border border-border px-3 py-2 text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-1">
                    성장 메모 (선택)
                  </label>
                  <input
                    type="text"
                    value={growthNote}
                    onChange={(e) => setGrowthNote(e.target.value)}
                    placeholder="e.g. 신엽 2장 전개, 가시 두께 증가"
                    className="w-full bg-secondary/20 border border-border px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block mb-1">
                  사진 파일 업로드 *
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="file"
                    ref={growthFileInputRef}
                    accept="image/*,.heic,.HEIC"
                    onChange={handleGrowthFileUpload}
                    disabled={uploadingGrowthPhoto}
                    className="text-[11px] font-mono text-muted-foreground file:mr-3 file:py-1 file:px-3 file:border file:border-border file:bg-background file:text-foreground file:text-xs file:cursor-pointer"
                  />
                  {uploadingGrowthPhoto && (
                    <span className="text-[10px] font-mono text-primary animate-pulse">
                      Uploading...
                    </span>
                  )}
                </div>
                {growthPhotoUrl && (
                  <div className="relative w-24 h-24 mt-2 border border-border overflow-hidden">
                    <Image src={growthPhotoUrl} alt="Growth Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-mono text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={growthSetMain}
                    onChange={(e) => setGrowthSetMain(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>이 사진을 메인 대표 사진으로 자동 변경</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingGrowthPhoto || uploadingGrowthPhoto || !growthPhotoUrl}
                  className="px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {submittingGrowthPhoto ? "Adding..." : "+ 사진 기록 등록"}
                </button>
              </div>
            </form>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-3">
                [ RECORDED TIMELINE / 등록된 날짜별 사진 목록 ({growthModalPlant.photos?.length || 0}) ]
              </span>

              {!growthModalPlant.photos || growthModalPlant.photos.length === 0 ? (
                <div className="p-4 border border-border text-center font-mono text-xs text-muted-foreground">
                  기본 사진 외 추가된 성장 사진이 없습니다.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {growthModalPlant.photos.map((photo) => {
                    const isMain = growthModalPlant.src === photo.src
                    return (
                      <div
                        key={photo.id}
                        className="border border-border p-3 flex items-center justify-between gap-4 bg-secondary/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 shrink-0 border border-border overflow-hidden">
                            <Image src={photo.src} alt={photo.date} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {photo.date}
                              </span>
                              {isMain && (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-primary/20 text-primary border border-primary/40">
                                  Main Cover
                                </span>
                              )}
                            </div>
                            {photo.note && (
                              <p className="text-xs text-muted-foreground mt-0.5">{photo.note}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteGrowthPhoto(photo.id)}
                          className="px-2.5 py-1 border border-red-500/40 text-red-400 text-[10px] font-mono hover:bg-red-500/10 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trash / Restore Modal */}
      {showTrashModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl border border-border bg-background p-6 md:p-8 max-h-[85vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                  [ TRASH & RESTORE / 휴지통 ]
                </span>
                <h3 className="font-serif text-2xl italic">
                  삭제된 개체 보관함 ({deletedPlants.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  실수로 삭제한 개체를 언제든지 원래 상태로 100% 복구할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTrashModal(false)}
                className="text-muted-foreground hover:text-foreground font-mono text-sm border border-border px-2 py-1 cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            {deletedPlants.length === 0 ? (
              <div className="py-16 text-center border border-border bg-secondary/5 font-mono text-xs text-muted-foreground">
                휴지통이 비어 있습니다. 삭제된 개체가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {deletedPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className="border border-border p-4 bg-secondary/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0 border border-border overflow-hidden bg-secondary/20">
                        <Image src={plant.src} alt={plant.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium">{plant.title}</h4>
                        <p className="text-xs text-muted-foreground">{plant.japaneseName || "—"}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Slug: {plant.slug}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestorePlant(plant.id)}
                      className="px-3.5 py-1.5 bg-foreground text-background text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                    >
                      ↩️ 개체 복구
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
