import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { ResearchItem } from '@/types'

export async function getResearchItems(opts: {
  page?: number
  limit?: number
  platform?: string
  converted?: boolean
} = {}): Promise<{ items: ResearchItem[]; total: number }> {
  const db = await getDb()
  const col = db.collection('researchItems')
  const { page = 1, limit = 50, platform, converted } = opts

  const filter: Record<string, unknown> = {}
  if (platform) filter.platform = platform
  if (converted !== undefined) filter.convertedToProduct = converted

  const [items, total] = await Promise.all([
    col.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return {
    items: items.map(doc => ({ ...doc, _id: doc._id.toString() })) as ResearchItem[],
    total,
  }
}

export async function getResearchItemById(id: string): Promise<ResearchItem | null> {
  const db = await getDb()
  if (!ObjectId.isValid(id)) return null
  const doc = await db.collection('researchItems').findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() } as ResearchItem
}
