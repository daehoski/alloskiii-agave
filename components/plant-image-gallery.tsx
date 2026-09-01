"use client"

import { useState } from "react"
import Image from "next/image"
import type { PlantPhotoRecord } from "@/lib/plants-data"

interface PlantImageGalleryProps {
  coverSrc: string
  title: string
  photos?: PlantPhotoRecord[]
}

export function PlantImageGallery({ coverSrc, title, photos }: PlantImageGalleryProps) {
  const allPhotos: PlantPhotoRecord[] =
    photos && photos.length > 0
      ? photos
      : [
          {
            id: "default",
            date: "Archive Record",
            src: coverSrc,
          },
        ]

  const [activePhoto, setActivePhoto] = useState<PlantPhotoRecord>(allPhotos[0])

  return (
    <div className="flex flex-col gap-6">
      {/* Big Main Image Viewer */}
      <div className="relative w-full aspect-[4/5] overflow-hidden border border-border bg-secondary/10 group">
        <Image
          src={activePhoto.src}
          alt={`${title} - ${activePhoto.date}`}
          fill
          priority
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 md:grayscale md:hover:grayscale-0"
        />

        {/* Date overlay badge on top-left of main photo */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md border border-border text-[11px] font-mono tracking-widest uppercase text-foreground">
          📅 {activePhoto.date}
        </div>
      </div>

      {activePhoto.note && (
        <p className="text-xs text-muted-foreground font-mono italic px-1">
          Note: {activePhoto.note}
        </p>
      )}

      {/* Growth Timeline Photo Selector (when multiple photos exist) */}
      {allPhotos.length > 1 && (
        <div className="border border-border p-4 bg-secondary/10 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              [ GROWTH TIMELINE / 성장 기록 ({allPhotos.length}) ]
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              사진을 클릭하여 시기별 모습 확인
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
            {allPhotos.map((photo) => {
              const isSelected = activePhoto.id === photo.id
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  className={`group relative flex flex-col border transition-all text-left overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-primary ring-1 ring-primary bg-primary/10"
                      : "border-border hover:border-foreground/50 bg-secondary/20"
                  }`}
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-background">
                    <Image
                      src={photo.src}
                      alt={photo.date}
                      fill
                      className={`object-cover transition-opacity ${
                        isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                  <div className="p-1.5 bg-background/90 text-center">
                    <span className="text-[9px] font-mono block text-foreground truncate">
                      {photo.date}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
