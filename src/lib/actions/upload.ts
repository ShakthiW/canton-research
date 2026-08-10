'use server'

import { getFirebaseStorageBucket } from '@/lib/firebase'

export async function uploadImageToFirebase(formData: FormData): Promise<{ url: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null
    if (!file || typeof file === 'string') {
      return { url: '', error: 'No file provided' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const bucket = getFirebaseStorageBucket()
    const rawFileName = file.name || 'photo.jpg'
    const extMatch = rawFileName.match(/\.([a-zA-Z0-9]+)$/)
    const ext = extMatch ? extMatch[1] : 'jpg'
    const destination = `canton-research/uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

    const fileRef = bucket.file(destination)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || 'image/jpeg',
      },
      resumable: false,
    })

    // Try making public for easy access
    try {
      await fileRef.makePublic()
    } catch (e) {
      console.warn('Could not make file public directly (Uniform bucket-level access might be enabled):', e)
    }

    // Public Firebase Storage URL format
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`

    return { url: publicUrl }
  } catch (err) {
    console.error('Firebase image upload error:', err)
    return { url: '', error: err instanceof Error ? err.message : 'Upload failed' }
  }
}
