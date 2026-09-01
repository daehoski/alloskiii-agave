import crypto from "crypto"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export interface PageViewEvent {
  id: string
  path: string
  plantSlug?: string
  referrer: string
  device: "mobile" | "desktop"
  timestamp: string
  date: string
  visitorHash: string
}

export interface AnalyticsSummary {
  todayVisitors: number
  todayPageViews: number
  totalPageViews: number
  instagramReferrals: number
  mobilePercentage: number
  topPlants: { slug: string; title: string; views: number }[]
  topPages: { path: string; views: number }[]
  referrers: { source: string; count: number }[]
  recentEvents: { path: string; referrer: string; device: string; time: string }[]
}

const ANALYTICS_FILE = "analytics.json"

export function logPageView(data: {
  path: string
  plantSlug?: string
  referrer?: string
  userAgent?: string
  ip?: string
}) {
  try {
    const events: PageViewEvent[] = readStorageJson<PageViewEvent[]>(ANALYTICS_FILE, [])

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const rawReferrer = (data.referrer || "").toLowerCase()

    let referrerType = "Direct / Link"
    if (rawReferrer.includes("instagram") || rawReferrer.includes("ig")) {
      referrerType = "Instagram Story"
    } else if (rawReferrer.includes("naver")) {
      referrerType = "Naver"
    } else if (rawReferrer.includes("google")) {
      referrerType = "Google"
    } else if (rawReferrer.includes("kakaotalk") || rawReferrer.includes("kakao")) {
      referrerType = "KakaoTalk"
    } else if (rawReferrer.includes("t.co") || rawReferrer.includes("twitter") || rawReferrer.includes("x.com")) {
      referrerType = "X (Twitter)"
    } else if (rawReferrer !== "" && !rawReferrer.includes("localhost") && !rawReferrer.includes("alloskiii")) {
      referrerType = "Other Web"
    }

    const ua = (data.userAgent || "").toLowerCase()
    const isMobile = /mobile|iphone|ipad|android|blackberry|iemobile|kindle/.test(ua)
    const device = isMobile ? "mobile" : "desktop"

    const ip = data.ip || "unknown"
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${ip}-${dateStr}-${ua}`)
      .digest("hex")
      .slice(0, 12)

    const newEvent: PageViewEvent = {
      id: crypto.randomUUID(),
      path: data.path,
      plantSlug: data.plantSlug,
      referrer: referrerType,
      device,
      timestamp: now.toISOString(),
      date: dateStr,
      visitorHash,
    }

    events.unshift(newEvent)
    const trimmed = events.slice(0, 5000)
    writeStorageJson(ANALYTICS_FILE, trimmed)
  } catch (error) {
    console.error("Analytics log error:", error)
  }
}

export function getAnalyticsSummary(): AnalyticsSummary {
  try {
    const events: PageViewEvent[] = readStorageJson<PageViewEvent[]>(ANALYTICS_FILE, [])

    const todayStr = new Date().toISOString().slice(0, 10)
    const todayEvents = events.filter((e) => e.date === todayStr)

    const todayUniqueVisitors = new Set(todayEvents.map((e) => e.visitorHash)).size
    const todayPageViews = todayEvents.length
    const totalPageViews = events.length
    const instagramReferrals = events.filter((e) => e.referrer === "Instagram Story").length

    const mobileCount = events.filter((e) => e.device === "mobile").length
    const mobilePercentage = totalPageViews > 0 ? Math.round((mobileCount / totalPageViews) * 100) : 100

    const plantCounts: Record<string, number> = {}
    events.forEach((e) => {
      if (e.plantSlug) {
        plantCounts[e.plantSlug] = (plantCounts[e.plantSlug] || 0) + 1
      }
    })
    const topPlants = Object.entries(plantCounts)
      .map(([slug, views]) => ({
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const pageCounts: Record<string, number> = {}
    events.forEach((e) => {
      pageCounts[e.path] = (pageCounts[e.path] || 0) + 1
    })
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const refCounts: Record<string, number> = {}
    events.forEach((e) => {
      refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1
    })
    const referrers = Object.entries(refCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    const recentEvents = events.slice(0, 10).map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      return {
        path: e.path,
        referrer: e.referrer,
        device: e.device,
        time,
      }
    })

    return {
      todayVisitors: todayUniqueVisitors || (todayPageViews > 0 ? 1 : 0),
      todayPageViews,
      totalPageViews,
      instagramReferrals,
      mobilePercentage,
      topPlants,
      topPages,
      referrers,
      recentEvents,
    }
  } catch (error) {
    console.error("Failed to get analytics summary:", error)
    return {
      todayVisitors: 0,
      todayPageViews: 0,
      totalPageViews: 0,
      instagramReferrals: 0,
      mobilePercentage: 0,
      topPlants: [],
      topPages: [],
      referrers: [],
      recentEvents: [],
    }
  }
}
