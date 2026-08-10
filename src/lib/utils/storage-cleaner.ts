import { getFirebaseStorageBucket } from '@/lib/firebase'

/**
 * Extracts Firebase Storage object paths from raw URL strings or markdown text.
 */
export function extractFirebaseObjectPaths(input: string | string[] | undefined | null): string[] {
  if (!input) return []

  const textToScan = Array.isArray(input) ? input.join(' ') : String(input)
  const paths: string[] = []

  // Regex to match firebasestorage URLs and capture object path after /o/
  const regex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?#]+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(textToScan)) !== null) {
    try {
      const decodedPath = decodeURIComponent(match[1])
      if (decodedPath.startsWith('canton-research/')) {
        paths.push(decodedPath)
      }
    } catch (e) {
      console.warn('Failed to decode Firebase URL path:', match[1], e)
    }
  }

  return Array.from(new Set(paths))
}

/**
 * Deletes files from Firebase Storage bucket given an array of URLs or markdown text content.
 */
export async function deleteFirebaseImages(input: string | string[] | undefined | null): Promise<number> {
  const objectPaths = extractFirebaseObjectPaths(input)
  if (objectPaths.length === 0) return 0

  let deletedCount = 0
  const bucket = getFirebaseStorageBucket()

  await Promise.all(
    objectPaths.map(async (objectPath) => {
      try {
        const fileRef = bucket.file(objectPath)
        const [exists] = await fileRef.exists()
        if (exists) {
          await fileRef.delete()
          deletedCount++
          console.log(`Deleted Firebase Storage asset: ${objectPath}`)
        }
      } catch (err) {
        console.warn(`Failed to delete Firebase object at ${objectPath}:`, err)
      }
    })
  )

  return deletedCount
}
