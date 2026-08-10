import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { Sample } from '@/types'

export async function getSamples(opts: {
  page?: number
  limit?: number
  status?: string
} = {}): Promise<{ items: Sample[]; total: number }> {
  const db = await getDb()
  const col = db.collection('samples')
  const { page = 1, limit = 50, status } = opts

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status

  const [items, total] = await Promise.all([
    col.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return {
    items: items.map(doc => ({ ...doc, _id: doc._id.toString() })) as Sample[],
    total,
  }
}

export async function getSampleById(id: string): Promise<Sample | null> {
  const db = await getDb()
  if (!ObjectId.isValid(id)) return null
  const doc = await db.collection('samples').findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() } as Sample
}
