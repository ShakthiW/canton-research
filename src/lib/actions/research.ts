'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'

export async function createResearchItem(data: {
  title: string
  url?: string
  platform?: string
  views?: number
  likes?: number
  notes?: string
}) {
  const db = await getDb()
  const doc = {
    title: data.title,
    productId: '',
    source: '',
    url: data.url || '',
    platform: data.platform || 'Other',
    dateDiscovered: new Date().toISOString(),
    views: data.views || 0,
    likes: data.likes || 0,
    comments: 0,
    shares: 0,
    trendStatus: 'Unknown',
    notes: data.notes || '',
    competitionNotes: '',
    potential: 'Unknown',
    researchScore: 0,
    convertedToProduct: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await db.collection('researchItems').insertOne(doc)
  revalidatePath('/research')
  const id = result.insertedId.toHexString()
  return {
    id,
    item: {
      _id: id,
      ...doc,
    },
  }
}

export async function convertResearchToProduct(researchId: string) {
  if (!ObjectId.isValid(researchId)) throw new Error('Invalid research ID')

  const db = await getDb()
  const research = await db
    .collection('researchItems')
    .findOne({ _id: new ObjectId(researchId) })

  if (!research) throw new Error('Research item not found')

  const productDoc = {
    name: research.title,
    description: '',
    category: 'Other',
    subcategory: '',
    imageUrl: '',
    productUrl: research.url,
    sourceUrl: research.url,
    sourcePlatform: research.platform,
    tags: [],
    notes: research.notes || '',
    status: 'Researching',
    tiktokViews: research.views || 0,
    instagramEngagement: research.likes || 0,
    googleTrendsScore: 0, searchInterest: 0,
    growthTrend: research.trendStatus || 'Unknown',
    viralStatus: research.trendStatus === 'Viral',
    demandConfidence: 50,
    sriLankanCompetitors: '', competitorCount: 0, localSellingPrice: 0,
    localAvailability: false, marketplacePresence: '', competitionLevel: 'Unknown',
    chinaCost: 0, moq: 0, sampleCost: 0, packagingCost: 0,
    shippingPerUnit: 0, customsPerUnit: 0, otherCosts: 0, landedCost: 0,
    sellingPrice: 0, currency: 'USD',
    score: 0, scoreDemand: 0, scoreMargin: 0, scoreCompetition: 0,
    scoreShipping: 0, scoreBrandability: 0, scoreContent: 0,
    scoreRepeatPurchase: 0, scoreRegulatory: 0, scoreSupplier: 0,
    rejectionReason: '',
    supplierIds: [],
    researchItemId: researchId,
    fairVisitId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('products').insertOne(productDoc)

  await db.collection('researchItems').updateOne(
    { _id: new ObjectId(researchId) },
    { $set: { convertedToProduct: true, productId: result.insertedId.toHexString(), updatedAt: new Date() } }
  )

  await db.collection('activities').insertOne({
    type: 'research_converted',
    entityId: result.insertedId.toHexString(),
    entityType: 'product',
    entityName: research.title,
    description: `Research "${research.title}" converted to product`,
    metadata: { researchId },
    createdAt: new Date(),
  })

  revalidatePath('/research')
  revalidatePath('/products')
  return { productId: result.insertedId.toHexString() }
}
