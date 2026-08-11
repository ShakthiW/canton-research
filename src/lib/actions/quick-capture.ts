'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'
import type { BoothInterestLevel, ProductStatus } from '@/types'

export interface QuickCaptureProductInput {
  name: string
  chinaCost?: number
  currency?: string
  moq?: number
  leadTimeDays?: number
  samplesAvailable?: 'Free' | 'Paid' | 'No' | 'Not Discussed'
  sampleCost?: number
  customizationOptions?: string[]
  paymentTerms?: string
  interestLevel: BoothInterestLevel
  notes?: string
  imageUrls?: string[]
}


export interface QuickCaptureSessionInput {
  companyName: string
  boothNumber: string
  hall?: string
  categories: string[]
  boothImageUrl?: string
  businessCardUrl?: string
  wechatId?: string
  wechatQrUrl?: string
  products: QuickCaptureProductInput[]
}

export async function saveQuickCaptureSession(data: QuickCaptureSessionInput) {
  if (!data.companyName.trim() && !data.boothNumber.trim()) {
    throw new Error('Company name or Booth number is required')
  }

  const db = await getDb()

  // 1. Create or update Supplier
  let supplierId = ''
  const trimmedCompany = data.companyName.trim()
  const trimmedBooth = data.boothNumber.trim()

  if (trimmedCompany) {
    const existingSupplier = await db.collection('suppliers').findOne({
      companyName: { $regex: new RegExp(`^${trimmedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    })

    if (existingSupplier) {
      supplierId = existingSupplier._id.toString()
      await db.collection('suppliers').updateOne(
        { _id: existingSupplier._id },
        {
          $set: {
            boothNumber: trimmedBooth || existingSupplier.boothNumber,
            wechat: data.wechatId || existingSupplier.wechat,
            categories: Array.from(new Set([...(existingSupplier.categories || []), ...data.categories])),
            updatedAt: new Date()
          }
        }
      )
      const firstProd = data.products[0]
      const hasCustomLogo = firstProd?.customizationOptions?.some(c => c.toLowerCase().includes('logo') || c.toLowerCase().includes('oem'))
      const hasCustomBox = firstProd?.customizationOptions?.some(c => c.toLowerCase().includes('box') || c.toLowerCase().includes('pack'))

      const sup = await db.collection('suppliers').insertOne({
        companyName: trimmedCompany,
        contactPerson: '',
        country: 'China',
        city: '',
        boothNumber: trimmedBooth,
        hall: data.hall || '',
        email: '',
        phone: '',
        wechat: data.wechatId || '',
        alibabaUrl: '',
        website: '',
        supplierType: 'Manufacturer',
        categories: data.categories || [],
        moq: firstProd?.moq || 0,
        leadTime: firstProd?.leadTimeDays ? `${firstProd.leadTimeDays} days` : '',
        paymentTerms: firstProd?.paymentTerms || '',
        customization: (firstProd?.customizationOptions && firstProd.customizationOptions.length > 0) || false,
        privateLabeling: hasCustomLogo || false,
        packagingCustomization: hasCustomBox || false,
        sampleAvailability: firstProd?.samplesAvailable === 'Free' || firstProd?.samplesAvailable === 'Paid',
        sampleCost: firstProd?.sampleCost || 0,
        notes: `Met at Canton Fair Booth ${trimmedBooth}. Business Card: ${data.businessCardUrl ? 'Attached' : 'N/A'}, WeChat: ${data.wechatId || 'N/A'}`,
        scoreQuality: 0, scorePricing: 0, scoreCommunication: 0,
        scoreMoq: 0, scoreCustomization: 0, scoreLeadTime: 0, scoreReliability: 0,
        score: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      supplierId = sup.insertedId.toString()
    }
  }

  // 2. Create products
  const createdProductIds: string[] = []

  for (const prodInput of data.products) {
    if (!prodInput.name.trim()) continue

    const chinaCost = prodInput.chinaCost || 0
    const landedCost = chinaCost * 1.4

    // Map interest level to product status
    let status: ProductStatus = 'Researching'
    if (prodInput.interestLevel === 'Shortlisted') status = 'Shortlisted'
    else if (prodInput.interestLevel === 'Interesting') status = 'Researching'
    else if (prodInput.interestLevel === 'Rejected') status = 'Rejected'

    const primaryCategory = data.categories[0] || 'Other'
    const imageUrl = prodInput.imageUrls?.[0] || data.boothImageUrl || ''

    const noteBlocks = [
      `Booth: ${trimmedBooth || 'N/A'}`,
      `Supplier: ${trimmedCompany || 'N/A'}`,
      `Interest Level: ${prodInput.interestLevel}`,
      prodInput.leadTimeDays ? `Lead Time: ${prodInput.leadTimeDays} Days` : undefined,
      prodInput.samplesAvailable ? `Sample: ${prodInput.samplesAvailable}${prodInput.sampleCost ? ` ($${prodInput.sampleCost})` : ''}` : undefined,
      prodInput.customizationOptions && prodInput.customizationOptions.length > 0 ? `Customizations: ${prodInput.customizationOptions.join(', ')}` : undefined,
      prodInput.paymentTerms ? `Payment Terms: ${prodInput.paymentTerms}` : undefined,
      prodInput.notes
    ].filter(Boolean)

    const prodDoc = {
      name: prodInput.name.trim(),
      description: '',
      category: primaryCategory,
      subcategory: '',
      imageUrl,
      productUrl: '',
      sourceUrl: '',
      sourcePlatform: 'Canton Fair',
      tags: ['Canton Fair', ...data.categories],
      notes: noteBlocks.join('\n'),
      status,
      tiktokViews: 0, instagramEngagement: 0, googleTrendsScore: 0,
      searchInterest: 0, growthTrend: 'Unknown', viralStatus: false, demandConfidence: 50,
      sriLankanCompetitors: '', competitorCount: 0, localSellingPrice: 0,
      localAvailability: false, marketplacePresence: '', competitionLevel: 'Unknown',
      chinaCost, moq: prodInput.moq || 0, sampleCost: prodInput.sampleCost || 0, packagingCost: 0,
      shippingPerUnit: 0, customsPerUnit: 0, otherCosts: 0, landedCost,
      sellingPrice: 0, currency: prodInput.currency || 'USD',

      score: prodInput.interestLevel === 'Shortlisted' ? 85 : 70,
      scoreDemand: 15, scoreMargin: 15, scoreCompetition: 15,
      scoreShipping: 8, scoreBrandability: 8, scoreContent: 8,
      scoreRepeatPurchase: 3, scoreRegulatory: 3, scoreSupplier: 0,
      rejectionReason: prodInput.interestLevel === 'Rejected' ? 'Not fitting criteria' : '',
      supplierIds: supplierId ? [supplierId] : [],
      researchItemId: '',
      fairVisitId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const prodRes = await db.collection('products').insertOne(prodDoc)
    const prodId = prodRes.insertedId.toString()
    createdProductIds.push(prodId)

    // Log individual product creation activity
    await db.collection('activities').insertOne({
      type: 'product_created',
      entityId: prodId,
      entityType: 'product',
      entityName: prodInput.name,
      description: `Product "${prodInput.name}" captured at Booth ${trimmedBooth || 'N/A'}`,
      metadata: { booth: trimmedBooth, company: trimmedCompany, interest: prodInput.interestLevel },
      createdAt: new Date(),
    })
  }

  // 3. Create Fair Visit record
  const visitDoc = {
    fairId: 'canton-fair-136',
    boothNumber: trimmedBooth,
    hall: data.hall || '',
    phase: 'Phase 1',
    supplierId,
    productId: createdProductIds[0] || '',
    visitDate: new Date().toISOString(),
    notes: `Quick capture session for ${trimmedCompany || 'Booth ' + trimmedBooth}. ${data.products.length} products added.`,
    priceQuoted: data.products[0]?.chinaCost || 0,
    moq: data.products[0]?.moq || 0,
    photoUrl: data.boothImageUrl || '',
    contactInfo: data.wechatId ? `WeChat: ${data.wechatId}` : '',
    interestLevel: data.products[0]?.interestLevel || 'Interesting',
    followUpRequired: data.products.some(p => p.interestLevel === 'Shortlisted' || p.interestLevel === 'Follow Up'),
    followUpDate: '',
    status: data.products[0]?.interestLevel || 'Interesting',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const visitRes = await db.collection('fairVisits').insertOne(visitDoc)

  // Log overall fair visit activity
  await db.collection('activities').insertOne({
    type: 'fair_visit_added',
    entityId: visitRes.insertedId.toString(),
    entityType: 'fair',
    entityName: `Booth ${trimmedBooth || 'Visit'} (${trimmedCompany || 'Supplier'})`,
    description: `Quick captured Booth ${trimmedBooth} with ${createdProductIds.length} products`,
    metadata: { booth: trimmedBooth, productsCount: createdProductIds.length },
    createdAt: new Date(),
  })

  revalidatePath('/canton-fair')
  revalidatePath('/products')
  revalidatePath('/suppliers')
  revalidatePath('/dashboard')

  return {
    success: true,
    supplierId,
    productIds: createdProductIds,
    visitId: visitRes.insertedId.toString()
  }
}
