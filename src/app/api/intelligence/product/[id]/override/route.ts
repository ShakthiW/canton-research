import { calculateSriLankaCustomsTaxes } from '@/lib/engines/customs-tax-engine'
import { calculateFreight } from '@/lib/engines/freight-engine'
import { calculateLandedCost } from '@/lib/engines/landed-cost-engine'
import { calculateMarginRoi } from '@/lib/engines/margin-roi-engine'
import { calculateOpportunityScore } from '@/lib/engines/scoring-engine'
import { getDb } from '@/lib/mongodb/db'
import { getSettings } from '@/lib/queries/settings'
import { CustomsTariff, FreightMode, FreightRateProfile, ProductIntelligenceState } from '@/types/intelligence'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await req.json()
    const { field, value } = body

    if (!field || value === undefined) {
      return NextResponse.json({ error: 'field and value are required' }, { status: 400 })
    }

    const db = await getDb()
    const settings = await getSettings()
    const productsCol = db.collection('products')

    const queryFilter = ObjectId.isValid(productId) ? { _id: new ObjectId(productId) } : { _id: productId as unknown as ObjectId }
    const product = await productsCol.findOne(queryFilter)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const intel: ProductIntelligenceState = product.intelligence || {
      productId,
      freshness: 'Fresh',
      suppliers: [],
      competitors: [],
      verificationChecklist: [],
    }

    const now = new Date().toISOString()

    // Apply manual override while preserving AI value
    if (field === 'unitWeightKg') {
      intel.unitWeightKg = {
        aiValue: intel.unitWeightKg?.aiValue || 0.45,
        manualValue: Number(value),
        effectiveValue: Number(value),
        sourceType: 'USER_ENTERED',
        confidence: 1.0,
        lastUpdated: now,
        updatedBy: 'Founder Override',
      }
    } else if (field === 'sellingPrice') {
      product.sellingPrice = Number(value)
    } else if (field === 'fobPriceUsd') {
      intel.fobPriceUsd = {
        aiValue: intel.fobPriceUsd?.aiValue || { min: 3.5, max: 4.2 },
        manualValue: { min: Number(value), max: Number(value) },
        effectiveValue: { min: Number(value), max: Number(value) },
        sourceType: 'USER_ENTERED',
        confidence: 1.0,
        lastUpdated: now,
        updatedBy: 'Founder Override',
      }
      product.chinaCost = Number(value)
    } else if (field === 'moq') {
      intel.moq = {
        aiValue: intel.moq?.aiValue || 100,
        manualValue: Number(value),
        effectiveValue: Number(value),
        sourceType: 'USER_ENTERED',
        confidence: 1.0,
        lastUpdated: now,
        updatedBy: 'Founder Override',
      }
      product.moq = Number(value)
    } else if (field === 'scoreAdjustment') {
      if (intel.opportunityScore) {
        intel.opportunityScore.manualAdjustment = Number(value)
        intel.opportunityScore.finalScore = Math.min(100, Math.max(0, intel.opportunityScore.aiScore + Number(value)))
      }
    }

    // Trigger Instant Deterministic Engine Recalculation
    const quantity = intel.moq?.effectiveValue || product.moq || 100
    const fobPriceUsd = intel.fobPriceUsd?.effectiveValue.min || product.chinaCost || 3.5
    const exchangeRate = settings.exchangeRates?.USD_TO_LKR || 305.0
    const unitWeightKg = intel.unitWeightKg?.effectiveValue || 0.45

    const userFreightProfile: FreightRateProfile = {
      name: settings.defaultFreightRate?.provider || 'Colombo LCL Express',
      provider: settings.defaultFreightRate?.provider || 'Colombo LCL Express',
      origin: 'Shenzhen',
      destination: 'Colombo',
      mode: (settings.defaultFreightRate?.mode as FreightMode) || 'SEA_LCL',
      serviceType: 'Standard LCL',
      pricingBasis: 'CBM',
      currency: 'USD',
      ratePerUnit: settings.defaultFreightRate?.ratePerCbmUsd || 145,
      minimumCharge: settings.defaultFreightRate?.minimumChargeUsd || 145,
      effectiveFrom: '2026-01-01',
      sourceType: 'USER_ENTERED',
      confidence: 0.9,
      active: true,
    }

    const hsCode = intel.hsCode?.effectiveValue || '3926.90.90'
    const matchedTariffDoc = await db.collection('customsTariffs').findOne({ hsCode })
    const activeTariffLine: CustomsTariff = matchedTariffDoc
      ? (matchedTariffDoc as unknown as CustomsTariff)
      : {
          hsCode,
          description: 'Imported Goods Heading',


          unit: 'u',
          generalDuty: { type: 'AD_VALOREM', ratePercent: 15 },
          vatRatePercent: 18,
          palRatePercent: 10,
          cess: { type: 'AD_VALOREM', ratePercent: 5 },
          ssclRatePercent: 2.5,
          version: '2026.01',
          effectiveFrom: '2026-01-01',
          sourceDocument: 'Sri Lanka Customs National Imports Tariff Guide 2026',
        }

    const freightCalc = calculateFreight({
      quantity,
      unitWeightKg,
      rateProfile: userFreightProfile,
      usdToLkrRate: exchangeRate,
    })

    const customsCalc = calculateSriLankaCustomsTaxes({
      tariffLine: activeTariffLine,
      cifValueLkr: (fobPriceUsd * quantity + freightCalc.totalFreightUsd) * exchangeRate,
      quantity,
    })

    const landedCostCalc = calculateLandedCost({
      quantity,
      fobPriceUsd,
      freightResult: freightCalc,
      customsResult: customsCalc,
      exchangeRate,
      fxMode: 'CUSTOMS_FX',
    })


    const targetPriceLkr = Number(product.sellingPrice) || landedCostCalc.landedCostPerUnitLkr * 2.5
    const marginRoiCalc = calculateMarginRoi({
      sellingPriceLkr: targetPriceLkr,
      landedCostPerUnitLkr: landedCostCalc.landedCostPerUnitLkr,
      quantity,
    })

    const shippingRatio = freightCalc.totalFreightLkr / Math.max(landedCostCalc.totalLandedCostLkr, 1)
    const scoreCalc = calculateOpportunityScore({
      demandScore: 78,
      grossMarginPercent: marginRoiCalc.grossMarginPercent,
      competitorCount: intel.competitors.length || 5,
      shippingToLandedRatio: shippingRatio,
      supplierConfidence: 0.85,
      contentPotentialScore: 80,
      marketGapScore: 75,
      isRegulatoryRestricted: false,
      totalInvestmentLkr: landedCostCalc.totalLandedCostLkr,
      manualAdjustment: intel.opportunityScore?.manualAdjustment || 0,
    })

    intel.customs = customsCalc
    intel.freight = freightCalc
    intel.landedCost = landedCostCalc
    intel.marginRoi = marginRoiCalc
    intel.opportunityScore = scoreCalc

    await productsCol.updateOne(
      queryFilter,
      {
        $set: {
          intelligence: intel,
          score: scoreCalc.finalScore,
          landedCost: landedCostCalc.landedCostPerUnitLkr,
          sellingPrice: targetPriceLkr,
          updatedAt: now,
        },
      }
    )


    return NextResponse.json({
      success: true,
      message: `Manual override for ${field} saved and calculations updated.`,
      intelligence: intel,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
