'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/mongodb/db'

import type { DiscoverySource, InitialInterest, DiscoveryReason, ProductStatus } from '@/types'

export interface CaptureProductInput {
  rawProductName: string
  imageUrl?: string
  images?: string[]
  source: DiscoverySource
  sourceUrl?: string
  reasons: DiscoveryReason[]
  initialInterest: InitialInterest
  rawCategory: string
  observedPrice?: {
    amount: number
    currency: 'USD' | 'CNY' | 'LKR' | 'EUR' | 'GBP' | 'OTHER'
    context?: 'Retail' | 'Wholesale' | 'Alibaba' | 'Ad' | 'Marketplace' | 'Unknown'
  }
  discoveryNote?: string
}

export async function captureProduct(input: CaptureProductInput) {
  if (!input.rawProductName.trim()) {
    throw new Error('Product name is required')
  }

  const db = await getDb()
  const now = new Date()

  const defaultImage = input.imageUrl || input.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'

  const observedAmount = input.observedPrice?.amount || 0
  const observedCurrency = input.observedPrice?.currency || 'USD'

  const discoveryData = {
    rawProductName: input.rawProductName.trim(),
    normalizedProductName: input.rawProductName.trim(),
    source: input.source,
    sourceUrl: input.sourceUrl || '',
    reasons: input.reasons || [],
    initialInterest: input.initialInterest || 'INTERESTING',
    rawCategory: input.rawCategory || 'Other',
    normalizedCategory: input.rawCategory || 'Other',
    observedPrice: input.observedPrice,
    discoveryNote: input.discoveryNote || '',
    discoveredAt: now.toISOString(),
    capturedAt: now.toISOString(),
  }

  const doc = {
    productType: 'DESK_RESEARCH',
    rawProductName: input.rawProductName.trim(),
    name: input.rawProductName.trim(),
    description: input.discoveryNote || `Captured from ${input.source}`,
    category: input.rawCategory || 'Other',
    subcategory: '',
    imageUrl: defaultImage,
    productUrl: input.sourceUrl || '',
    sourceUrl: input.sourceUrl || '',
    sourcePlatform: input.source === 'TIKTOK' ? 'TikTok' : input.source === 'ALIBABA' ? 'Alibaba' : input.source === 'INSTAGRAM' ? 'Instagram' : 'Other',
    tags: ['Rapid Capture', input.source, input.rawCategory],
    notes: input.discoveryNote || '',
    researchHighlights: `Discovery Note: ${input.discoveryNote || 'None'}`,
    discovery: discoveryData,
    status: 'Researching' as ProductStatus,
    tiktokViews: 0,
    instagramEngagement: 0,
    googleTrendsScore: 0,
    searchInterest: 0,
    growthTrend: 'Emerging',
    viralStatus: input.reasons.includes('VIRAL_LOOKS'),
    demandConfidence: 60,
    sriLankanCompetitors: '',
    competitorCount: 0,
    localSellingPrice: observedCurrency === 'LKR' ? observedAmount : 0,
    localAvailability: false,
    marketplacePresence: '',
    competitionLevel: 'Low',
    chinaCost: observedCurrency === 'USD' ? observedAmount : 0,
    moq: 100,
    sampleCost: 0,
    packagingCost: 0,
    shippingPerUnit: 0,
    customsPerUnit: 0,
    otherCosts: 0,
    landedCost: 0,
    sellingPrice: observedCurrency === 'LKR' ? observedAmount : 0,
    currency: observedCurrency === 'LKR' ? 'LKR' : 'USD',
    score: 75,
    scoreDemand: 15, scoreMargin: 15, scoreCompetition: 15,
    scoreShipping: 8, scoreBrandability: 8, scoreContent: 8,
    scoreRepeatPurchase: 3, scoreRegulatory: 3, scoreSupplier: 0,
    rejectionReason: '',
    supplierIds: [],
    researchItemId: '',
    createdAt: now,
    updatedAt: now,
  }

  const res = await db.collection('products').insertOne(doc)
  const id = res.insertedId.toString()

  // Automatically register a Fair Visit if captured from Canton Fair
  if (input.source === 'CANTON_FAIR') {
    const boothMatch = input.rawProductName.match(/booth\s*([a-z0-9.-]+)/i) || input.discoveryNote?.match(/booth\s*([a-z0-9.-]+)/i)
    const boothNumber = boothMatch ? boothMatch[1].toUpperCase() : 'FLOOR-FIND'

    await db.collection('fairVisits').insertOne({
      fairId: 'canton-140',
      boothNumber,
      hall: 'Hall 1.1',
      phase: 'Phase 1',
      supplierId: '',
      productId: id,
      productName: input.rawProductName.trim(),
      supplierName: 'Canton Fair Booth Supplier',
      visitDate: now.toISOString(),
      notes: input.discoveryNote || 'Captured via Rapid Product Capture',
      priceQuoted: observedCurrency === 'USD' ? observedAmount : 0,
      moq: 100,
      leadTimeDays: 15,
      customPackagingAvailable: true,
      sampleCostUsd: 20,
      paymentTerms: '30% Deposit, 70% T/T',
      photoUrl: defaultImage,
      contactInfo: '',
      interestLevel: input.initialInterest === 'MUST_INVESTIGATE' ? 'Shortlisted' : 'Interesting',
      followUpRequired: input.initialInterest === 'MUST_INVESTIGATE',
      followUpDate: '',
      status: input.initialInterest === 'MUST_INVESTIGATE' ? 'Shortlisted' : 'Interesting',
      createdAt: now,
      updatedAt: now,
    })
  }

  // Log activity
  await db.collection('activities').insertOne({
    type: 'product_captured',
    entityId: id,
    entityType: 'product',
    entityName: input.rawProductName,
    description: `Product captured: "${input.rawProductName}" via ${input.source}`,
    metadata: { source: input.source, category: input.rawCategory },
    createdAt: now,
  })

  revalidatePath('/canton-fair')
  revalidatePath('/desk-research')
  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { success: true, id }
}

