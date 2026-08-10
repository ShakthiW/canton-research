'use server'

import { revalidatePath } from 'next/cache'

import { getDb } from '@/lib/mongodb/db'
import type { BoothInterestLevel } from '@/types'

export async function createFairVisit(data: {
  fairId: string
  boothNumber: string
  hall: string
  phase?: string
  supplierName?: string
  productName?: string
  notes?: string
  priceQuoted?: number
  moq?: number
  leadTimeDays?: number
  customPackagingAvailable?: boolean
  sampleCostUsd?: number
  paymentTerms?: string
  interestLevel: BoothInterestLevel
  followUpRequired?: boolean
  contactInfo?: string
}) {

  const db = await getDb()

  let supplierId = ''
  let productId = ''

  // Automatically create or link supplier if provided
  if (data.supplierName) {
    const existingSupplier = await db.collection('suppliers').findOne({
      companyName: { $regex: new RegExp(`^${data.supplierName}$`, 'i') }
    })
    if (existingSupplier) {
      supplierId = existingSupplier._id.toString()
    } else {
      const sup = await db.collection('suppliers').insertOne({
        companyName: data.supplierName,
        contactPerson: '',
        country: 'China',
        city: '',
        boothNumber: data.boothNumber,
        hall: data.hall,
        email: '',
        phone: '',
        wechat: data.contactInfo || '',
        alibabaUrl: '',
        website: '',
        supplierType: 'Manufacturer',
        categories: [],
        moq: data.moq || 0,
        leadTime: '',
        paymentTerms: '',
        customization: false,
        privateLabeling: false,
        packagingCustomization: false,
        sampleAvailability: false,
        sampleCost: 0,
        notes: `Met at Canton Fair booth ${data.boothNumber}. ${data.notes || ''}`,
        scoreQuality: 0, scorePricing: 0, scoreCommunication: 0,
        scoreMoq: 0, scoreCustomization: 0, scoreLeadTime: 0, scoreReliability: 0,
        score: 70,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      supplierId = sup.insertedId.toString()
    }
  }

  // Automatically create product if provided
  if (data.productName) {
    const prod = await db.collection('products').insertOne({
      name: data.productName,
      description: '',
      category: 'Other',
      subcategory: '',
      imageUrl: '',
      productUrl: '',
      sourceUrl: '',
      sourcePlatform: 'Canton Fair',
      tags: ['Canton Fair'],
      notes: `Booth ${data.boothNumber}. ${data.notes || ''}`,
      status: data.interestLevel === 'Shortlisted' ? 'Shortlisted' : 'Researching',
      tiktokViews: 0, instagramEngagement: 0, googleTrendsScore: 0,
      searchInterest: 0, growthTrend: 'Unknown', viralStatus: false, demandConfidence: 50,
      sriLankanCompetitors: '', competitorCount: 0, localSellingPrice: 0,
      localAvailability: false, marketplacePresence: '', competitionLevel: 'Unknown',
      chinaCost: data.priceQuoted || 0, moq: data.moq || 0, sampleCost: 0, packagingCost: 0,
      shippingPerUnit: 0, customsPerUnit: 0, otherCosts: 0, landedCost: (data.priceQuoted || 0) * 1.4,
      sellingPrice: 0, currency: 'USD',
      score: 75, scoreDemand: 15, scoreMargin: 15, scoreCompetition: 15,
      scoreShipping: 8, scoreBrandability: 8, scoreContent: 8,
      scoreRepeatPurchase: 3, scoreRegulatory: 3, scoreSupplier: 0,
      rejectionReason: '',
      supplierIds: supplierId ? [supplierId] : [],
      researchItemId: '',
      fairVisitId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    productId = prod.insertedId.toString()
  }

  const visitDoc = {
    fairId: data.fairId,
    boothNumber: data.boothNumber,
    hall: data.hall,
    phase: data.phase || 'Phase 1',
    supplierId,
    productId,
    productName: data.productName || '',
    supplierName: data.supplierName || '',
    visitDate: new Date().toISOString(),
    notes: data.notes || '',
    priceQuoted: data.priceQuoted || 0,
    moq: data.moq || 0,
    leadTimeDays: data.leadTimeDays || 15,
    customPackagingAvailable: data.customPackagingAvailable ?? true,
    sampleCostUsd: data.sampleCostUsd || 0,
    paymentTerms: data.paymentTerms || '30% Deposit, 70% Balance',
    photoUrl: '',
    contactInfo: data.contactInfo || '',
    interestLevel: data.interestLevel,
    followUpRequired: Boolean(data.followUpRequired),
    followUpDate: '',
    status: data.interestLevel,
    createdAt: new Date(),
    updatedAt: new Date(),
  }


  const result = await db.collection('fairVisits').insertOne(visitDoc)

  await db.collection('activities').insertOne({
    type: 'fair_visit_added',
    entityId: result.insertedId.toString(),
    entityType: 'fair',
    entityName: `Booth ${data.boothNumber} (${data.supplierName || data.productName || 'Visit'})`,
    description: `Recorded Canton Fair visit at Booth ${data.boothNumber}`,
    metadata: { booth: data.boothNumber, interest: data.interestLevel },
    createdAt: new Date(),
  })

  revalidatePath('/canton-fair')
  revalidatePath('/products')
  revalidatePath('/suppliers')
  revalidatePath('/dashboard')

  return { id: result.insertedId.toString() }
}
