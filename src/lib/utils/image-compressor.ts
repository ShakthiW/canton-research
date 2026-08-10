/**
 * Compresses an image file in the browser before upload.
 * Resizes max dimension to maxPx (default 1920px) and applies JPEG quality (default 0.82).
 * Reduces phone photos from 10MB+ down to ~300KB-600KB without visible quality loss.
 */
export async function compressImage(
  file: File,
  maxPx = 1920,
  quality = 0.82,
  onProgress?: (pct: number) => void
): Promise<File> {
  // If not an image or smaller than 200KB, skip compression
  if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
    onProgress?.(100)
    return file
  }

  onProgress?.(10)

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      onProgress?.(40)
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        onProgress?.(60)
        let { width, height } = img

        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width)
            width = maxPx
          } else {
            width = Math.round((width * maxPx) / height)
            height = maxPx
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          onProgress?.(100)
          return resolve(file)
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        onProgress?.(80)

        canvas.toBlob(
          (blob) => {
            onProgress?.(100)
            if (!blob) {
              return resolve(file)
            }
            // Retain original name with .jpg extension
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => {
        onProgress?.(100)
        resolve(file)
      }
    }

    reader.onerror = () => {
      onProgress?.(100)
      resolve(file)
    }
  })
}
