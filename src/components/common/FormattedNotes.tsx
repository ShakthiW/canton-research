'use client'

import { useState } from 'react'
import Image from 'next/image'
import { RiImageLine, RiZoomInLine, RiCloseLine } from '@remixicon/react'

interface FormattedNotesProps {
  text?: string
  additionalImages?: string[]
  className?: string
}

export function parseNotesContent(text?: string): { cleanText: string; images: string[] } {
  if (!text || typeof text !== 'string') return { cleanText: '', images: [] }

  const images: string[] = []

  // 1. Extract markdown image syntax: ![alt](url)
  const markdownImgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g
  let match: RegExpExecArray | null

  while ((match = markdownImgRegex.exec(text)) !== null) {
    if (match[2] && !images.includes(match[2])) {
      images.push(match[2])
    }
  }

  // Clean out the ![alt](url) strings from text
  let cleanText = text.replace(markdownImgRegex, '').trim()

  // 2. Check for raw standalone image URLs (including Firebase storage links)
  const rawUrlRegex = /(https?:\/\/(?:firebasestorage\.googleapis\.com[^\s\)]+|[^\s\)]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s\)]*)?))/gi
  let rawMatch: RegExpExecArray | null
  while ((rawMatch = rawUrlRegex.exec(cleanText)) !== null) {
    if (rawMatch[1] && !images.includes(rawMatch[1])) {
      images.push(rawMatch[1])
    }
  }

  cleanText = cleanText.replace(rawUrlRegex, '').trim()

  return { cleanText, images }
}

export function FormattedNotes({ text, additionalImages = [], className = '' }: FormattedNotesProps) {
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null)
  const { cleanText, images: extractedImages } = parseNotesContent(text)

  // Merge extracted images with additionalImages uniquely
  const allImages = Array.from(new Set([...extractedImages, ...(additionalImages || [])]))

  if (!cleanText && allImages.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No research notes or proof photos attached.</p>
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Text Content */}
      {cleanText && (
        <div className="whitespace-pre-line text-xs font-medium leading-relaxed text-foreground space-y-1">
          {cleanText}
        </div>
      )}

      {/* Attached Proof & Photos Gallery */}
      {allImages.length > 0 && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <RiImageLine className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Attached Proof Photos & Visual Notes ({allImages.length})</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePreviewImage(imgUrl)}
                className="group relative size-28 sm:size-32 rounded-xl overflow-hidden border border-border shadow-2xs hover:shadow-md transition-all hover:scale-[1.02] bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <Image
                  src={imgUrl}
                  alt={`Proof Photo ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 112px, 128px"
                  unoptimized={imgUrl.includes('firebasestorage') || imgUrl.startsWith('data:')}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <RiZoomInLine className="size-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {activePreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors shadow-lg"
              title="Close Preview"
            >
              <RiCloseLine className="size-6" />
            </button>

            <div className="relative w-full h-full max-h-[85vh] rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src={activePreviewImage}
                alt="Full Proof Preview"
                fill
                className="object-contain"
                unoptimized={activePreviewImage.includes('firebasestorage') || activePreviewImage.startsWith('data:')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
