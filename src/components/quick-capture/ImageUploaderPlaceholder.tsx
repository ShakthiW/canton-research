'use client'

import { useState, useRef } from 'react'
import { RiCameraLine, RiUpload2Line, RiCloseLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { compressImage } from '@/lib/utils/image-compressor'
import { toast } from 'sonner'

interface ImageUploaderPlaceholderProps {
  label?: string
  subtitle?: string
  images: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  type?: 'booth' | 'product' | 'card' | 'qr'
}

function ProgressRing({ progress, size = 44, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/60"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary transition-all duration-150 ease-out"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold font-mono text-primary">
        {Math.round(progress)}%
      </span>
    </div>
  )
}

function uploadFileWithProgress(file: File, onProgress: (pct: number) => void): Promise<{ url: string; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        // Upload phase spans 25% to 95%
        const uploadPct = 25 + (e.loaded / e.total) * 70
        onProgress(uploadPct)
      }
    })

    xhr.addEventListener('load', () => {
      onProgress(100)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText)
          resolve({ url: res.url })
        } catch {
          resolve({ url: '', error: 'Invalid response from server' })
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText)
          resolve({ url: '', error: res.error || 'Upload failed' })
        } catch {
          resolve({ url: '', error: `HTTP ${xhr.status}` })
        }
      }
    })

    xhr.addEventListener('error', () => {
      resolve({ url: '', error: 'Network error during upload' })
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

export function ImageUploaderPlaceholder({
  label,
  subtitle,
  images,
  onChange,
  multiple = false,
}: ImageUploaderPlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    const uploadedUrls: string[] = []
    const totalFiles = files.length

    try {
      const fileList = Array.from(files)
      for (let i = 0; i < fileList.length; i++) {
        const rawFile = fileList[i]

        // Phase 1: Client-side compression (0% -> 25%)
        const compressed = await compressImage(rawFile, 1920, 0.82, (compPct) => {
          const fileBasePct = (i / totalFiles) * 100
          const fileSpan = 100 / totalFiles
          setUploadProgress(fileBasePct + (compPct * 0.25 * fileSpan / 100))
        })

        // Phase 2: Upload compressed file with real XHR progress (25% -> 100%)
        const res = await uploadFileWithProgress(compressed, (fileUploadPct) => {
          const fileBasePct = (i / totalFiles) * 100
          const fileSpan = 100 / totalFiles
          setUploadProgress(fileBasePct + (fileUploadPct * fileSpan / 100))
        })

        if (res.url) {
          uploadedUrls.push(res.url)
        } else if (res.error) {
          toast.error(`Upload failed: ${res.error}`)
        }
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange([...images, ...uploadedUrls])
        } else {
          onChange([uploadedUrls[0]])
        }
        toast.success(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {(label || subtitle) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </label>
          )}
          {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
              <Image width={120} height={120} src={url} alt={`Photo ${idx + 1}`} unoptimized className="w-full h-full object-cover" />
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
            <div className="flex flex-col gap-1.5 aspect-square rounded-xl border-2 border-dashed border-border bg-card p-1.5 items-center justify-center">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <ProgressRing progress={uploadProgress} size={42} strokeWidth={3.5} />
                  <span className="text-[9px] font-semibold text-muted-foreground mt-1">Uploading</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 w-full flex flex-col items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-[10px] font-semibold"
                  >
                    <RiCameraLine className="size-4 mb-0.5" />
                    <span>Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full flex flex-col items-center justify-center rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors text-[10px] font-semibold"
                  >
                    <RiUpload2Line className="size-4 mb-0.5" />
                    <span>Library</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {isUploading ? (
            <div className="col-span-2 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-primary/30 bg-primary/5 min-h-[48px]">
              <ProgressRing progress={uploadProgress} size={36} strokeWidth={3} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Uploading Image...</span>
                <span className="text-[10px] text-muted-foreground">Compressing & sending to Firebase</span>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all active:scale-[0.99] touch-manipulation min-h-[48px]"
              >
                <RiCameraLine className="size-5 shrink-0" />
                <span className="text-xs font-semibold">Take Photo</span>
              </button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-dashed h-[48px] text-xs font-semibold text-foreground hover:bg-muted transition-all touch-manipulation"
              >
                <RiUpload2Line className="size-4 text-muted-foreground" />
                <span>Choose File</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
