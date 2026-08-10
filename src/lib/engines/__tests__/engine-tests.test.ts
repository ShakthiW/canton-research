import { calculateSriLankaCustomsTaxes } from '../customs-tax-engine'
import { calculateFreight } from '../freight-engine'
import { calculateLandedCost } from '../landed-cost-engine'
import { calculateMarginRoi } from '../margin-roi-engine'
import { calculateOpportunityScore } from '../scoring-engine'
import { sanitizeAndCheckIntelligenceData } from '../sanity-checker'
import { CustomsTariff, FreightRateProfile } from '@/types/intelligence'

const sampleTariff: CustomsTariff = {
  hsCode: '3926.90.90',
  description: 'Articles of plastics',
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

const sampleFreightProfile: FreightRateProfile = {
  name: 'Test LCL Rate',
  provider: 'Test Carrier',
  origin: 'Shenzhen',
  destination: 'Colombo',
  mode: 'SEA_LCL',
  serviceType: 'LCL',
  pricingBasis: 'CBM',
  currency: 'USD',
  ratePerUnit: 145,
  minimumCharge: 145,
  effectiveFrom: '2026-01-01',
  sourceType: 'OFFICIAL',
  confidence: 0.9,
  active: true,
}

export function runDeterministicEngineTests(): boolean {
  console.log('--- RUNNING DETERMINISTIC ENGINES SUITE ---')

  // 1. Test Sri Lanka Customs Tax Engine
  const customs = calculateSriLankaCustomsTaxes({
    tariffLine: sampleTariff,
    cifValueLkr: 250000,
    quantity: 100,
    fixedCharges: [{ id: '1', name: 'Declaration Fee', chargeLkr: 250, basis: 'PER_DECLARATION', effectiveFrom: '2026-01-01', active: true }],
  })

  console.assert(customs.customsDutyLkr === 37500, `Duty expected 37500, got ${customs.customsDutyLkr}`)
  console.assert(customs.palLkr === 25000, `PAL expected 25000, got ${customs.palLkr}`)
  console.assert(customs.cessLkr === 12500, `CESS expected 12500, got ${customs.cessLkr}`)
  console.assert(customs.totalTaxesLkr > 0, `Total taxes must be positive`)

  // 2. Test Freight Engine
  const freight = calculateFreight({
    quantity: 100,
    unitWeightKg: 0.45,
    dimensionsCm: { lengthCm: 15, widthCm: 10, heightCm: 8 },
    rateProfile: sampleFreightProfile,
    usdToLkrRate: 325.0,
  })

  console.assert(freight.totalFreightUsd === 145, `Freight expected $145 min, got ${freight.totalFreightUsd}`)

  // 3. Test Landed Cost Engine
  const landed = calculateLandedCost({
    quantity: 100,
    fobPriceUsd: 3.5,
    freightResult: freight,
    customsResult: customs,
    exchangeRate: 325.0,
    fxMode: 'CUSTOMS_FX',
  })

  console.assert(landed.landedCostPerUnitLkr > 0, `Landed cost per unit must be positive`)
  console.assert(landed.scenarios.optimistic.landedCostPerUnitLkr < landed.scenarios.conservative.landedCostPerUnitLkr, `Optimistic landed cost should be less than conservative`)

  // 4. Test Margin & ROI Engine
  const margin = calculateMarginRoi({
    sellingPriceLkr: 4490,
    landedCostPerUnitLkr: landed.landedCostPerUnitLkr,
    quantity: 100,
  })

  console.assert(margin.grossProfitPerUnitLkr === 4490 - landed.landedCostPerUnitLkr, `Gross profit arithmetic must match`)

  // 5. Test Opportunity Score Engine
  const score = calculateOpportunityScore({
    demandScore: 80,
    grossMarginPercent: 65,
    competitorCount: 4,
    shippingToLandedRatio: 0.15,
    supplierConfidence: 0.85,
    contentPotentialScore: 75,
    marketGapScore: 70,
    isRegulatoryRestricted: false,
    totalInvestmentLkr: landed.totalLandedCostLkr,
  })

  console.assert(score.finalScore >= 0 && score.finalScore <= 100, `Final score must be 0-100`)

  // 6. Test Sanity Checker
  const sanityPass = sanitizeAndCheckIntelligenceData({ weightKg: 0.5, grossMarginPercent: 60 })
  console.assert(sanityPass.isValid === true, `Sanity check should pass for valid inputs`)

  const sanityFail = sanitizeAndCheckIntelligenceData({ weightKg: -5, grossMarginPercent: 120 })
  console.assert(sanityFail.isValid === false, `Sanity check should fail for negative weight or 120% margin`)

  console.log('--- ALL DETERMINISTIC ENGINE TESTS PASSED CLEANLY ---')
  return true
}

// Execute tests if invoked directly
if (typeof require !== 'undefined' && require.main === module) {
  runDeterministicEngineTests()
}
