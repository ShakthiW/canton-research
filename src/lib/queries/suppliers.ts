import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { Supplier } from '@/types'

const LIST_PROJECTION = {
  _id: 1, companyName: 1, contactPerson: 1, country: 1, city: 1, boothNumber: 1, hall: 1,
  supplierType: 1, categories: 1, moq: 1, score: 1, email: 1, wechat: 1, phone: 1, createdAt: 1,
}

export async function getSuppliers(opts: {
  page?: number
  limit?: number
  search?: string
  category?: string
} = {}): Promise<{ items: Supplier[]; total: number }> {
  const db = await getDb()
  const col = db.collection('suppliers')
  const { page = 1, limit = 50, search, category } = opts

  const filter: Record<string, unknown> = {}
  if (search) filter.$text = { $search: search }
  if (category) filter.categories = category

  const [items, total] = await Promise.all([
    col
      .find(filter, { projection: LIST_PROJECTION })
      .sort({ score: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ])

  return {
    items: items.map(doc => ({ ...doc, _id: doc._id.toString() })) as Supplier[],
    total,
  }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const db = await getDb()
  if (!ObjectId.isValid(id)) return null
  const doc = await db.collection('suppliers').findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() } as Supplier
}

export async function searchSuppliers(query: string, limit = 10): Promise<Pick<Supplier, '_id' | 'companyName' | 'city' | 'categories'>[]> {
  const db = await getDb()
  const regex = new RegExp(query, 'i')
  const items = await db
    .collection('suppliers')
    .find(
      { companyName: { $regex: regex } },
      { projection: { _id: 1, companyName: 1, city: 1, categories: 1 } }
    )
    .limit(limit)
    .toArray()
  return items.map(doc => ({ ...doc, _id: doc._id.toString() })) as Pick<Supplier, '_id' | 'companyName' | 'city' | 'categories'>[]
}
