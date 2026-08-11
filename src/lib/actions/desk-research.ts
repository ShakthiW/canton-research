'use server'

import { revalidatePath } from 'next/cache'
import { ObjectId, Filter, Document } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { OverseasProviderOffer, SocialProofEntry, LocalCompetitorListing, ProductStatus } from '@/types'

function getProductFilter(id: string): Filter<Document> {
  return ObjectId.isValid(id) ? ({ _id: new ObjectId(id) } as unknown as Filter<Document>) : ({ _id: id } as unknown as Filter<Document>)
}

export interface CreateDeskResearchProductInput {
  name: string
  category: string
  sourceUrl?: string
  sellingPriceLkr?: number
  unitWeightKg?: number
  imageUrls?: string[]
  researchHighlights?: string
  notes?: string
  leadTimeDays?: number
  samplesAvailable?: 'Free' | 'Paid' | 'No' | 'Not Discussed'
  sampleCost?: number
  customizationOptions?: string[]
  paymentTerms?: string
  providers?: Array<{
    platform: '1688' | 'Alibaba' | 'Taobao' | 'Made-in-China' | 'Other'
    storeName: string
    storeUrl?: string
    fobPriceUsd: number
    fobPriceCny?: number
    moq: number
    isPreferred?: boolean
  }>
  socialProofs?: Array<{
    platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Douyin' | 'Other'
    postUrl: string
    viewsCount?: number
    likesCount?: number
    commentsCount?: number
    commentFeedbackSummary: string
  }>
  localCompetitors?: Array<{
    platform: 'Daraz' | 'Instagram Shop' | 'Facebook Page' | 'Direct Website' | 'Retail Shop'
    storeName: string
    productUrl?: string
    sellingPriceLkr: number
    observations?: string
  }>
}

export async function createDeskResearchProduct(input: CreateDeskResearchProductInput) {
  if (!input.name.trim()) {
    throw new Error('Product name is required')
  }

  const db = await getDb()

  const preferredProvider = input.providers?.find(p => p.isPreferred) || input.providers?.[0]
  const chinaCost = preferredProvider?.fobPriceUsd || 0
  const landedCost = chinaCost * 1.4

  const providers: OverseasProviderOffer[] = (input.providers || []).map((p, idx) => ({
    id: `prov_${Date.now()}_${idx}`,
    platform: p.platform,
    storeName: p.storeName || 'Online Supplier',
    storeUrl: p.storeUrl || '',
    fobPriceUsd: p.fobPriceUsd,
    fobPriceCny: p.fobPriceCny,
    moq: p.moq || 100,
    isPreferred: p.isPreferred ?? (idx === 0),
  }))

  const socialProofs: SocialProofEntry[] = (input.socialProofs || []).map((s, idx) => ({
    id: `soc_${Date.now()}_${idx}`,
    platform: s.platform,
    postUrl: s.postUrl,
    viewsCount: s.viewsCount,
    likesCount: s.likesCount,
    commentsCount: s.commentsCount,
    commentFeedbackSummary: s.commentFeedbackSummary,
    recordedAt: new Date().toISOString(),
  }))

  const localCompetitors: LocalCompetitorListing[] = (input.localCompetitors || []).map((c, idx) => ({
    id: `comp_${Date.now()}_${idx}`,
    platform: c.platform,
    storeName: c.storeName || 'Local Seller',
    productUrl: c.productUrl,
    sellingPriceLkr: c.sellingPriceLkr,
    observations: c.observations,
  }))

  const imageUrl = input.imageUrls?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'

  const doc = {
    productType: 'DESK_RESEARCH',
    name: input.name.trim(),
    description: input.researchHighlights || '',
    category: input.category || 'Other',
    subcategory: '',
    imageUrl,
    images: input.imageUrls || [imageUrl],
    productUrl: input.sourceUrl || '',
    sourceUrl: input.sourceUrl || '',
    sourcePlatform: 'Alibaba',
    tags: ['Desk Research', input.category],
    notes: input.notes || '',
    researchHighlights: input.researchHighlights || '',
    overseasProviders: providers,
    socialProofs,
    localCompetitors,
    status: 'Researching' as ProductStatus,
    tiktokViews: socialProofs[0]?.viewsCount || 0,
    instagramEngagement: socialProofs[0]?.likesCount || 0,
    googleTrendsScore: 0,
    searchInterest: 0,
    growthTrend: 'Emerging',
    viralStatus: socialProofs.length > 0,
    demandConfidence: 75,
    sriLankanCompetitors: localCompetitors.map(c => `${c.storeName} (Rs. ${c.sellingPriceLkr})`).join(', '),
    competitorCount: localCompetitors.length,
    localSellingPrice: localCompetitors[0]?.sellingPriceLkr || input.sellingPriceLkr || 0,
    localAvailability: localCompetitors.length > 0,
    marketplacePresence: localCompetitors[0]?.platform || '',
    competitionLevel: localCompetitors.length > 3 ? 'High' : localCompetitors.length > 0 ? 'Medium' : 'Low',
    chinaCost,
    moq: preferredProvider?.moq || 100,
    sampleCost: input.sampleCost || 0,
    packagingCost: 0,
    shippingPerUnit: 0,
    customsPerUnit: 0,
    otherCosts: 0,
    landedCost,
    sellingPrice: input.sellingPriceLkr || 0,
    currency: 'USD',
    score: 80,
    scoreDemand: 16, scoreMargin: 16, scoreCompetition: 12,
    scoreShipping: 8, scoreBrandability: 8, scoreContent: 8,
    scoreRepeatPurchase: 4, scoreRegulatory: 4, scoreSupplier: 4,
    rejectionReason: '',
    supplierIds: [],
    researchItemId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const res = await db.collection('products').insertOne(doc)
  const id = res.insertedId.toString()

  await db.collection('activities').insertOne({
    type: 'product_created',
    entityId: id,
    entityType: 'product',
    entityName: input.name,
    description: `Desk Research product logged: "${input.name}" with ${providers.length} provider offers & ${socialProofs.length} social links`,
    metadata: { productType: 'DESK_RESEARCH', category: input.category },
    createdAt: new Date(),
  })

  revalidatePath('/desk-research')
  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { success: true, id }
}

export async function updateDeskResearchProductAction(id: string, updates: Partial<{
  name: string
  category: string
  chinaCost: number
  sellingPrice: number
  status: ProductStatus
  sourceUrl: string
  notes: string
  researchHighlights: string
}>) {
  const db = await getDb()
  const filter = getProductFilter(id)

  const setObj: Record<string, unknown> = { updatedAt: new Date() }
  if (updates.name !== undefined) setObj.name = updates.name.trim()
  if (updates.category !== undefined) setObj.category = updates.category
  if (updates.chinaCost !== undefined) setObj.chinaCost = Number(updates.chinaCost)
  if (updates.sellingPrice !== undefined) setObj.sellingPrice = Number(updates.sellingPrice)
  if (updates.status !== undefined) setObj.status = updates.status
  if (updates.sourceUrl !== undefined) setObj.sourceUrl = updates.sourceUrl
  if (updates.notes !== undefined) setObj.notes = updates.notes
  if (updates.researchHighlights !== undefined) setObj.researchHighlights = updates.researchHighlights

  await db.collection('products').updateOne(filter, { $set: setObj })

  revalidatePath(`/desk-research/${id}`)
  revalidatePath('/desk-research')
  revalidatePath('/products')
  return { success: true }
}

export async function addOverseasProviderAction(productId: string, provider: Omit<OverseasProviderOffer, 'id'>) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  const newProvider: OverseasProviderOffer = {
    ...provider,
    id: `prov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  }

  await db.collection('products').updateOne(filter, {
    $push: { overseasProviders: newProvider as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  revalidatePath('/desk-research')
  return { success: true, newProvider }
}

export async function deleteOverseasProviderAction(productId: string, providerId: string) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  await db.collection('products').updateOne(filter, {
    $pull: { overseasProviders: { id: providerId } as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  return { success: true }
}

export async function addSocialProofAction(productId: string, socialProof: Omit<SocialProofEntry, 'id' | 'recordedAt'>) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  const newProof: SocialProofEntry = {
    ...socialProof,
    id: `soc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recordedAt: new Date().toISOString(),
  }

  await db.collection('products').updateOne(filter, {
    $push: { socialProofs: newProof as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  return { success: true, newProof }
}

export async function deleteSocialProofAction(productId: string, socialProofId: string) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  await db.collection('products').updateOne(filter, {
    $pull: { socialProofs: { id: socialProofId } as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  return { success: true }
}

export async function addLocalCompetitorAction(productId: string, competitor: Omit<LocalCompetitorListing, 'id'>) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  const newCompetitor: LocalCompetitorListing = {
    ...competitor,
    id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  }

  await db.collection('products').updateOne(filter, {
    $push: { localCompetitors: newCompetitor as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  return { success: true, newCompetitor }
}

export async function deleteLocalCompetitorAction(productId: string, competitorId: string) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  await db.collection('products').updateOne(filter, {
    $pull: { localCompetitors: { id: competitorId } as unknown as Document } as unknown as object,
    $set: { updatedAt: new Date() },
  })

  revalidatePath(`/desk-research/${productId}`)
  return { success: true }
}

export async function convertToCantonProductAction(productId: string) {
  const db = await getDb()
  const filter = getProductFilter(productId)

  await db.collection('products').updateOne(filter, {
    $set: {
      productType: 'CANTON_FAIR',
      status: 'Shortlisted' as ProductStatus,
      updatedAt: new Date(),
    },
  })

  revalidatePath(`/desk-research/${productId}`)
  revalidatePath(`/products/${productId}`)
  revalidatePath('/desk-research')
  revalidatePath('/products')
  return { success: true }
}
