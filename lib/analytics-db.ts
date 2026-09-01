import crypto from "crypto"
import { readStorageJson, writeStorageJson } from "./storage-helper"

export interface PageViewEvent {
  id: string
  path: string
  plantSlug?: string
  referrer: string
  device: string
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
  dailyViews: { date: string; views: number; visitors: number }[]
}

const ANALYTICS_FILE = "analytics.json"

export async function logPageView(data: {
  path: string
  plantSlug?: string
  referrer?: string
  userAgent?: string
  ip?: string
}) {
  try {
    const events = await readStorageJson<PageViewEvent[]>(ANALYTICS_FILE, [])
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const rawReferrer = (data.referrer || "").toLowerCase()

    let referrerType = "Direct / Link"
    if (rawReferrer.includes("instagram") || rawReferrer.includes("ig")) referrerType = "Instagram Story"
    else if (rawReferrer.includes("naver")) referrerType = "Naver"
    else if (rawReferrer.includes("google")) referrerType = "Google"
    else if (rawReferrer.includes("kakaotalk") || rawReferrer.includes("kakao")) referrerType = "KakaoTalk"
    else if (rawReferrer.includes("t.co") || rawReferrer.includes("twitter") || rawReferrer.includes("x.com")) referrerType = "X (Twitter)"
    else if (rawReferrer !== "" && !rawReferrer.includes("localhost") && !rawReferrer.includes("alloskiii")) referrerType = "Other Web"

    let deviceType = "Desktop"
    const ua = (data.userAgent || "").toLowerCase()
    if (ua.includes("iphone")) deviceType = "iPhone"
    else if (ua.includes("ipad")) deviceType = "iPad"
    else if (ua.includes("android")) deviceType = "Android"
    else if (ua.includes("mac os")) deviceType = "Mac"
    else if (ua.includes("windows")) deviceType = "Windows"
    else if (/mobile|blackberry|iemobile|kindle/.test(ua)) deviceType = "Mobile"

    const visitorHash = crypto.createHash("sha256")
      .update(`${data.ip || "unknown"}-${dateStr}-${ua}`)
      .digest("hex").slice(0, 12)

    events.unshift({
      id: crypto.randomUUID(),
      path: data.path,
      plantSlug: data.plantSlug,
      referrer: referrerType,
      device: deviceType,
      timestamp: now.toISOString(),
      date: dateStr,
      visitorHash,
    })

    await writeStorageJson(ANALYTICS_FILE, events.slice(0, 5000))
  } catch (error) {
    console.error("Analytics log error:", error)
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const events = await readStorageJson<PageViewEvent[]>(ANALYTICS_FILE, [])
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayEvents = events.filter((e) => e.date === todayStr)

    const todayUniqueVisitors = new Set(todayEvents.map((e) => e.visitorHash)).size
    const mobileCount = events.filter((e) => ["iPhone", "iPad", "Android", "Mobile", "mobile"].includes(e.device)).length

    const plantCounts: Record<string, number> = {}
    const pageCounts: Record<string, number> = {}
    const refCounts: Record<string, number> = {}
    
    const dailyMap: Record<string, { views: number; hashes: Set<string> }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      dailyMap[ds] = { views: 0, hashes: new Set() }
    }

    events.forEach((e) => {
      if (e.plantSlug) plantCounts[e.plantSlug] = (plantCounts[e.plantSlug] || 0) + 1
      pageCounts[e.path] = (pageCounts[e.path] || 0) + 1
      refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1
      
      if (dailyMap[e.date]) {
        dailyMap[e.date].views++
        dailyMap[e.date].hashes.add(e.visitorHash)
      }
    })
    
    const dailyViews = Object.entries(dailyMap).map(([date, data]) => ({
      date: date.slice(5).replace("-", "/"),
      views: data.views,
      visitors: data.hashes.size,
    }))

    return {
      todayVisitors: todayUniqueVisitors || (todayEvents.length > 0 ? 1 : 0),
      todayPageViews: todayEvents.length,
      totalPageViews: events.length,
      instagramReferrals: events.filter((e) => e.referrer === "Instagram Story").length,
      mobilePercentage: events.length > 0 ? Math.round((mobileCount / events.length) * 100) : 100,
      topPlants: Object.entries(plantCounts)
        .map(([slug, views]) => ({ slug, title: slug.charAt(0).toUpperCase() + slug.slice(1), views }))
        .sort((a, b) => b.views - a.views).slice(0, 5),
      topPages: Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views).slice(0, 5),
      referrers: Object.entries(refCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      recentEvents: events.slice(0, 15).map((e) => ({
        path: e.path,
        referrer: e.referrer,
        device: e.device,
        time: new Date(e.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      })),
      dailyViews,
    }
  } catch (error) {
    console.error("Analytics summary error:", error)
    return { todayVisitors: 0, todayPageViews: 0, totalPageViews: 0, instagramReferrals: 0, mobilePercentage: 0, topPlants: [], topPages: [], referrers: [], recentEvents: [], dailyViews: [] }
  }
}
