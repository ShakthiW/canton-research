import { FreightCalculationResult, FreightRateProfile } from '@/types/intelligence'

export interface CalculateFreightInput {
  quantity: number
  unitWeightKg?: number
  dimensionsCm?: {
    lengthCm: number
    widthCm: number
    heightCm: number
  }
  cartonDetails?: {
    unitsPerCarton: number
    lengthCm: number
    widthCm: number
    heightCm: number
    grossWeightKg: number
  }
  rateProfile: FreightRateProfile
  usdToLkrRate: number
}

/**
 * Deterministic Freight Calculation Engine.
 * Supports CBM, Volumetric Weight, Minimum Charge, Air, Sea LCL, Courier.
 */
export function calculateFreight(input: CalculateFreightInput): FreightCalculationResult {
  const { quantity, unitWeightKg = 0.5, dimensionsCm, cartonDetails, rateProfile, usdToLkrRate } = input

  // 1. Calculate Actual Weight
  let actualWeightKg = unitWeightKg * quantity
  if (cartonDetails && cartonDetails.unitsPerCarton > 0) {
    const totalCartons = Math.ceil(quantity / cartonDetails.unitsPerCarton)
    actualWeightKg = totalCartons * cartonDetails.grossWeightKg
  }

  // 2. Calculate Total CBM (Prefer carton dimensions if provided)
  let totalCbm = 0
  if (cartonDetails && cartonDetails.unitsPerCarton > 0) {
    const totalCartons = Math.ceil(quantity / cartonDetails.unitsPerCarton)
    const cartonCbm = (cartonDetails.lengthCm * cartonDetails.widthCm * cartonDetails.heightCm) / 1_000_000
    totalCbm = totalCartons * cartonCbm
  } else if (dimensionsCm) {
    const unitCbm = (dimensionsCm.lengthCm * dimensionsCm.widthCm * dimensionsCm.heightCm) / 1_000_000
    totalCbm = unitCbm * quantity
  } else {
    // Default fallback estimate: 0.002 CBM per unit (~20x10x10 cm)
    totalCbm = 0.002 * quantity
  }

  // Round CBM to 3 decimal places
  totalCbm = Number(totalCbm.toFixed(3))

  // 3. Volumetric Weight Calculation
  const divisor = rateProfile.volumetricDivisor || (rateProfile.mode === 'SEA_LCL' ? 1000 : 5000)
  let totalVolumeCm3 = totalCbm * 1_000_000
  const volumetricWeightKg = Number((totalVolumeCm3 / divisor).toFixed(2))

  const chargeableWeightKg = Math.max(actualWeightKg, volumetricWeightKg)

  // 4. Calculate Freight based on Pricing Basis
  let baseFreightUsd = 0

  switch (rateProfile.pricingBasis) {
    case 'CBM': {
      const cbmToCharge = Math.max(totalCbm, 1) // minimum 1 CBM for LCL
      baseFreightUsd = cbmToCharge * rateProfile.ratePerUnit
      break
    }
    case 'CHARGEABLE_KG': {
      baseFreightUsd = chargeableWeightKg * rateProfile.ratePerUnit
      break
    }
    case 'KG': {
      baseFreightUsd = actualWeightKg * rateProfile.ratePerUnit
      break
    }
    case 'SHIPMENT':
    case 'CONTAINER': {
      baseFreightUsd = rateProfile.ratePerUnit
      break
    }
  }

  const finalFreightUsd = Math.max(baseFreightUsd, rateProfile.minimumCharge)
  const totalFreightLkr = Math.round(finalFreightUsd * usdToLkrRate)

  // Ranges
  const optimisticUsd = Math.round(finalFreightUsd * 0.85)
  const expectedUsd = Math.round(finalFreightUsd)
  const conservativeUsd = Math.round(finalFreightUsd * 1.25)

  return {
    mode: rateProfile.mode,
    actualWeightKg: Number(actualWeightKg.toFixed(2)),
    totalCbm,
    chargeableWeightKg: Number(chargeableWeightKg.toFixed(2)),
    pricingBasis: rateProfile.pricingBasis,
    ratePerUnitUsd: rateProfile.ratePerUnit,
    totalFreightUsd: Math.round(finalFreightUsd),
    totalFreightLkr,
    rangeUsd: {
      optimistic: optimisticUsd,
      expected: expectedUsd,
      conservative: conservativeUsd,
    },
    providerName: rateProfile.provider,
    confidence: rateProfile.confidence,
  }
}
