import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { getAllPosts, getPostBySlug } from "@/lib/journal-db"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await getPostBySlug(decodedSlug) || await getPostBySlug(slug)
  if (!post) return { title: "Post Not Found" }

  return {
    title: `${post.title} — ALLOSKIII JOURNAL`,
    description: post.subtitle || post.title,
  }
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await getPostBySlug(decodedSlug) || await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null

  // Render paragraphs and headers
  const renderFormattedContent = (raw: string) => {
    const parseInlineLinks = (text: string) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      const parts = []
      let lastIndex = 0
      let match

      while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index))
        }
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-colors"
          >
            {match[1]}
          </a>
        )
        lastIndex = linkRegex.lastIndex
      }
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
      }
      return parts.length > 0 ? parts : text
    }

    const lines = raw.split("\n")
    return lines.map((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-serif text-2xl md:text-3xl mt-8 mb-4 text-foreground italic">
            {trimmed.replace("### ", "")}
          </h3>
        )
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="font-serif text-3xl md:text-4xl mt-10 mb-5 text-foreground">
            {trimmed.replace("## ", "")}
          </h2>
        )
      }
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        return (
          <li key={idx} className="ml-6 list-disc text-sm md:text-base leading-relaxed text-muted-foreground my-1.5 font-light">
            {parseInlineLinks(trimmed.replace(/^[\*\-]\s+/, ""))}
          </li>
        )
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <li key={idx} className="ml-6 list-decimal text-sm md:text-base leading-relaxed text-muted-foreground my-1.5 font-light">
            {parseInlineLinks(trimmed.replace(/^\d+\.\s+/, ""))}
          </li>
        )
      }
      if (trimmed === "") {
        return <div key={idx} className="h-4" />
      }
      // Image Markdown Parsing: ![alt](url) (한 줄에 이미지 하나)
      if (trimmed.startsWith("![") && trimmed.includes("](") && trimmed.endsWith(")")) {
        const altMatch = trimmed.match(/!\[(.*?)\]/)
        const urlMatch = trimmed.match(/\((.*?)\)/)
        if (urlMatch) {
          return (
            <div key={idx} className="w-full my-8">
              <img 
                src={urlMatch[1]} 
                alt={altMatch?.[1] || "Journal Image"} 
                className="w-full h-auto border border-border bg-secondary/10" 
              />
              {altMatch?.[1] && (
                <p className="text-center text-[10px] font-mono text-muted-foreground mt-2">
                  {altMatch[1]}
                </p>
              )}
            </div>
          )
        }
      }
      return (
        <p key={idx} className="text-sm md:text-base leading-relaxed text-muted-foreground/90 font-light my-2">
          {parseInlineLinks(trimmed)}
        </p>
      )
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground pt-24">
      <NavBar />

      <article className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-12">
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-border pb-6 mb-12">
          <Link
            href="/journal"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group font-medium font-mono"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Journal</span>
          </Link>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="uppercase px-2 py-0.5 border border-border">
              {post.category}
            </span>
            <span>{post.date}</span>
          </div>
        </div>

        {/* Article Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-lg md:text-2xl font-light text-muted-foreground leading-relaxed font-sans">
              {post.subtitle}
            </p>
          )}
          {post.readTime && (
            <div className="mt-6 text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              Published on {post.date} — {post.readTime}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden border border-border bg-secondary/10 mb-16">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover md:grayscale md:hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        )}

        {/* Main Body Essay */}
        <div className="max-w-3xl prose prose-invert font-sans border-t border-border/50 pt-10">
          {renderFormattedContent(post.content)}
        </div>

        {/* Article Pagination */}
        <div className="mt-24 pt-12 border-t border-border grid grid-cols-2 gap-4">
          <div>
            {prevPost ? (
              <Link
                href={`/journal/${prevPost.slug}`}
                className="group flex flex-col items-start gap-1 text-left hover:opacity-80 transition-opacity"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                  ← Previous Article
                </span>
                <span className="font-serif text-lg md:text-xl italic group-hover:-translate-x-1 transition-transform">
                  {prevPost.title}
                </span>
              </Link>
            ) : null}
          </div>

          <div className="text-right">
            {nextPost ? (
              <Link
                href={`/journal/${nextPost.slug}`}
                className="group flex flex-col items-end gap-1 text-right hover:opacity-80 transition-opacity"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                  Next Article →
                </span>
                <span className="font-serif text-lg md:text-xl italic group-hover:translate-x-1 transition-transform">
                  {nextPost.title}
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
