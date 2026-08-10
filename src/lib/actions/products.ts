'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'
import type { ProductStatus } from '@/types'

export async function createProduct(data: {
  name: string
  category: string
  chinaCost?: number
  moq?: number
  sellingPrice?: number
  status?: ProductStatus
  sourcePlatform?: string
  boothNumber?: string
  supplierName?: string
  notes?: string
  imageUrl?: string
}) {
  const db = await getDb()

  // Basic landed cost calculation
  const chinaCost = data.chinaCost || 0
  const landedCost = chinaCost * 1.4 // rough 40% markup for shipping + customs

  const doc = {
    name: data.name,
    description: '',
    category: data.category || 'Other',
    subcategory: '',
    imageUrl: data.imageUrl || '',
    productUrl: '',
    sourceUrl: '',
    sourcePlatform: data.sourcePlatform || 'Other',
    tags: [],
    notes: data.notes || '',
    status: data.status || 'Researching',
    tiktokViews: 0, instagramEngagement: 0, googleTrendsScore: 0,
    searchInterest: 0, growthTrend: 'Unknown', viralStatus: false, demandConfidence: 50,
    sriLankanCompetitors: '', competitorCount: 0, localSellingPrice: 0,
    localAvailability: false, marketplacePresence: '', competitionLevel: 'Unknown',
    chinaCost, moq: data.moq || 0, sampleCost: 0, packagingCost: 0,
    shippingPerUnit: 0, customsPerUnit: 0, otherCosts: 0, landedCost,
    sellingPrice: data.sellingPrice || 0, currency: 'USD',
    score: 0, scoreDemand: 0, scoreMargin: 0, scoreCompetition: 0,
    scoreShipping: 0, scoreBrandability: 0, scoreContent: 0,
    scoreRepeatPurchase: 0, scoreRegulatory: 0, scoreSupplier: 0,
    rejectionReason: '',
    supplierIds: [], researchItemId: '', fairVisitId: '',
    createdAt: new Date(), updatedAt: new Date(),
  }

  const result = await db.collection('products').insertOne(doc)

  // Log activity
  await db.collection('activities').insertOne({
    type: 'product_created',
    entityId: result.insertedId.toHexString(),
    entityType: 'product',
    entityName: data.name,
    description: `Product "${data.name}" created`,
    metadata: { boothNumber: data.boothNumber, supplierName: data.supplierName },
    createdAt: new Date(),
  })

  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { id: result.insertedId.toHexString() }
}

export async function updateProduct(id: string, data: Partial<{
  name: string
  description: string
  category: string
  subcategory: string
  imageUrl: string
  productUrl: string
  sourceUrl: string
  sourcePlatform: string
  tags: string[]
  notes: string
  status: ProductStatus
  tiktokViews: number
  instagramEngagement: number
  googleTrendsScore: number
  searchInterest: number
  growthTrend: string
  viralStatus: boolean
  demandConfidence: number
  sriLankanCompetitors: string
  competitorCount: number
  localSellingPrice: number
  localAvailability: boolean
  marketplacePresence: string
  competitionLevel: string
  chinaCost: number
  moq: number
  sampleCost: number
  packagingCost: number
  shippingPerUnit: number
  customsPerUnit: number
  otherCosts: number
  landedCost: number
  sellingPrice: number
  currency: string
  score: number
  scoreDemand: number
  scoreMargin: number
  scoreCompetition: number
  scoreShipping: number
  scoreBrandability: number
  scoreContent: number
  scoreRepeatPurchase: number
  scoreRegulatory: number
  scoreSupplier: number
  rejectionReason: string
}>) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid product ID')

  const db = await getDb()
  await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )

  revalidatePath(`/products/${id}`)
  revalidatePath('/products')
  return { success: true }
}

export async function updateProductStatus(id: string, status: ProductStatus, previousStatus?: string) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid product ID')

  const db = await getDb()
  const product = await db.collection('products').findOne(
    { _id: new ObjectId(id) },
    { projection: { name: 1 } }
  )

  await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  )

  // Log activity
  await db.collection('activities').insertOne({
    type: 'product_status_changed',
    entityId: id,
    entityType: 'product',
    entityName: product?.name || 'Unknown',
    description: `Status changed to ${status}`,
    metadata: { from: previousStatus, to: status },
    createdAt: new Date(),
  })

  revalidatePath(`/products/${id}`)
  revalidatePath('/products')
  revalidatePath('/dashboard')
  revalidatePath('/shortlist')

  return { success: true }
}

export async function deleteProduct(id: string) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid product ID')
  const db = await getDb()
  await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function bulkUpdateProducts(ids: string[], update: {
  status?: ProductStatus
  tags?: string[]
}) {
  const db = await getDb()
  const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))

  const setOp: Record<string, unknown> = { updatedAt: new Date() }
  if (update.status) setOp.status = update.status

  const result = await db.collection('products').updateMany(
    { _id: { $in: objectIds } },
    { $set: setOp, ...(update.tags ? { $addToSet: { tags: { $each: update.tags } } } : {}) }
  )

  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { modifiedCount: result.modifiedCount }
}
