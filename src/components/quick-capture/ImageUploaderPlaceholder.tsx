'use client'

import { useState, useRef } from 'react'
import { RiCameraLine, RiAddLine, RiCloseLine, RiImageLine, RiQrCodeLine, RiBankCardLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'

interface ImageUploaderPlaceholderProps {
  label: string
  subtitle?: string
  images: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  type?: 'booth' | 'product' | 'card' | 'qr'
}

export function ImageUploaderPlaceholder({
  label,
  subtitle,
  images,
  onChange,
  multiple = false,
  type = 'product',
}: ImageUploaderPlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Demo stock image options for quick fair simulation on phone
  const SAMPLE_PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
  ]

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newUrls: string[] = []
    Array.from(files).forEach(file => {
      newUrls.push(URL.createObjectURL(file))
    })

    if (multiple) {
      onChange([...images, ...newUrls])
    } else {
      onChange([newUrls[0]])
    }
  }

  function handleAddMockPhoto() {
    setIsCapturing(true)
    setTimeout(() => {
      const randomImg = SAMPLE_PLACEHOLDERS[Math.floor(Math.random() * SAMPLE_PLACEHOLDERS.length)]
      if (multiple) {
        onChange([...images, randomImg])
      } else {
        onChange([randomImg])
      }
      setIsCapturing(false)
    }, 400)
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  const getIcon = () => {
    switch (type) {
      case 'booth': return RiImageLine
      case 'card': return RiBankCardLine
      case 'qr': return RiQrCodeLine
      default: return RiCameraLine
    }
  }

  const IconComp = getIcon()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
              <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>
          ))}

          {(multiple || images.length === 0) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-accent/40 transition-colors"
            >
              <RiAddLine className="size-6 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium mt-1">Add Photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all active:scale-[0.99] touch-manipulation min-h-[48px]"
          >
            <RiCameraLine className="size-5 shrink-0" />
            <span className="text-xs font-semibold">Take Photo / Upload</span>
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMockPhoto}
            disabled={isCapturing}
            className="text-xs font-normal text-muted-foreground h-[48px] px-3 border-dashed"
          >
            <IconComp className="size-4 mr-1 text-muted-foreground" />
            {isCapturing ? 'Snapping...' : 'Use Sample Photo'}
          </Button>
        </div>
      )}
    </div>
  )
}
