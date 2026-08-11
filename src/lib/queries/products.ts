import 'server-only'
import { ObjectId, type Filter } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { Product, ProductListItem, DashboardStats, PipelineCounts, Activity } from '@/types'

const LIST_PROJECTION = {
  _id: 1, productType: 1, name: 1, category: 1, status: 1, chinaCost: 1, landedCost: 1,
  sellingPrice: 1, moq: 1, score: 1, competitionLevel: 1, currency: 1,
  imageUrl: 1, tags: 1, updatedAt: 1, sourcePlatform: 1, growthTrend: 1, supplierIds: 1,
  researchHighlights: 1, overseasProviders: 1,
}

export async function getProducts(opts: {
  page?: number
  limit?: number
  status?: string
  category?: string
  minScore?: number
  search?: string
  sort?: string
  source?: string
  competition?: string
  productType?: string
  excludeProductType?: string
} = {}): Promise<{ items: ProductListItem[]; total: number }> {
  const db = await getDb()
  const col = db.collection('products')

  const { page = 1, limit = 50, status, category, minScore, search, sort = 'updatedAt', source, competition, productType, excludeProductType } = opts

  const filter: Filter<object> = {}
  if (excludeProductType) {
    filter.productType = { $ne: excludeProductType }
  } else if (productType) {
    filter.productType = productType
  }
  if (status) filter.status = status
  if (category) filter.category = category
  if (minScore !== undefined) filter.score = { $gte: minScore }
  if (source) filter.sourcePlatform = source
  if (competition) filter.competitionLevel = competition
  if (search) filter.$text = { $search: search }


  const sortMap: Record<string, import('mongodb').Sort> = {
    updatedAt: { updatedAt: -1 },
    createdAt: { createdAt: -1 },
    score: { score: -1 },
    margin: { sellingPrice: -1 },
    moq: { moq: 1 },
  }

  const [items, total] = await Promise.all([
    col
      .find(filter, { projection: LIST_PROJECTION })
      .sort(sortMap[sort] || { updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ])

  return {
    items: items.map(doc => ({ ...doc, _id: doc._id.toString() })) as ProductListItem[],
    total,
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDb()
  const col = db.collection('products')
  if (!ObjectId.isValid(id)) return null
  const doc = await col.findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { ...doc, _id: doc._id.toString() } as Product
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb()
  const col = db.collection('products')

  const [stats, samplesOrdered, samplesPending] = await Promise.all([
    col
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] } },
            avgScore: { $avg: '$score' },
            validated: { $sum: { $cond: [{ $eq: ['$status', 'Validated'] }, 1, 0] } },
            maxMargin: {
              $max: {
                $cond: [
                  { $gt: ['$sellingPrice', 0] },
                  { $multiply: [{ $divide: [{ $subtract: ['$sellingPrice', '$landedCost'] }, '$sellingPrice'] }, 100] },
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray(),
    db.collection('samples').countDocuments({ status: { $in: ['Ordered', 'Shipped'] } }),
    db.collection('samples').countDocuments({ finalDecision: 'Pending' }),
    db.collection('suppliers').countDocuments(),
  ])

  const suppliers = await db.collection('suppliers').countDocuments()
  const s = stats[0] || {}

  return {
    totalProducts: s.total || 0,
    shortlisted: s.shortlisted || 0,
    avgScore: Math.round(s.avgScore || 0),
    bestMargin: Math.round(s.maxMargin || 0),
    totalSuppliers: suppliers,
    samplesOrdered,
    samplesPending,
    validated: s.validated || 0,
  }
}

export async function getPipelineCounts(): Promise<PipelineCounts> {
  const db = await getDb()
  const result = await db
    .collection('products')
    .aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    .toArray()

  const counts: PipelineCounts = {
    Researching: 0,
    Shortlisted: 0,
    'Supplier Contacted': 0,
    'Sample Ordered': 0,
    'Sample Received': 0,
    Testing: 0,
    Validated: 0,
    'Ready to Order': 0,
    Ordered: 0,
  }
  result.forEach(r => {
    if (r._id in counts) counts[r._id as keyof PipelineCounts] = r.count
  })
  return counts
}

export async function getTopOpportunities(limit = 5): Promise<ProductListItem[]> {
  const db = await getDb()
  const items = await db
    .collection('products')
    .find(
      { status: { $nin: ['Rejected', 'Archived'] } },
      { projection: LIST_PROJECTION }
    )
    .sort({ score: -1 })
    .limit(limit)
    .toArray()

  return items.map(doc => ({ ...doc, _id: doc._id.toString() })) as ProductListItem[]
}

export async function getRecentActivity(limit = 10): Promise<Activity[]> {
  const db = await getDb()
  const items = await db
    .collection('activities')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return items.map(doc => ({ ...doc, _id: doc._id.toString() })) as Activity[]
}

export async function getSidebarCounts() {
  const db = await getDb()
  const [products, deskResearch, shortlisted, suppliers, samples, validation] = await Promise.all([
    db.collection('products').countDocuments({ status: { $nin: ['Rejected', 'Archived'] } }),
    db.collection('products').countDocuments({ productType: 'DESK_RESEARCH', status: { $nin: ['Rejected', 'Archived'] } }),
    db.collection('products').countDocuments({ status: 'Shortlisted' }),
    db.collection('suppliers').countDocuments(),
    db.collection('samples').countDocuments({ status: { $in: ['Ordered', 'Shipped'] } }),
    db.collection('validations').countDocuments(),
  ])
  return { products, deskResearch, shortlisted, suppliers, samples, validation }
}


