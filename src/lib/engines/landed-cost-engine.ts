import { CustomsCalculationResult, FreightCalculationResult, LandedCostResult, LandedCostScenario } from '@/types/intelligence'

export interface CalculateLandedCostInput {
  quantity: number
  fobPriceUsd: number
  freightResult: FreightCalculationResult
  customsResult: CustomsCalculationResult
  exchangeRate: number
  fxMode: 'CUSTOMS_FX' | 'PLANNING_FX'
  clearingChargesLkr?: number
  localTransportLkr?: number
  insuranceRatePercent?: number // default 0.5%
}

/**
 * Deterministic Landed Cost Engine.
 * Calculates Goods Cost, Freight, CIF, Customs, Clearing, Local Transport, and Per-Unit Landed Cost.
 * Generates Optimistic, Expected, and Conservative scenarios.
 */
export function calculateLandedCost(input: CalculateLandedCostInput): LandedCostResult {
  const {
    quantity,
    fobPriceUsd,
    freightResult,
    customsResult,
    exchangeRate,
    fxMode,
    clearingChargesLkr = 15000,
    localTransportLkr = 8000,
    insuranceRatePercent = 0.5,
  } = input

  // 1. Goods Cost
  const goodsCostUsd = fobPriceUsd * quantity
  const goodsCostLkr = Math.round(goodsCostUsd * exchangeRate)

  // 2. Freight Cost
  const freightCostLkr = freightResult.totalFreightLkr

  // 3. Insurance Cost
  const insuranceCostUsd = (goodsCostUsd * insuranceRatePercent) / 100
  const insuranceCostLkr = Math.round(insuranceCostUsd * exchangeRate)

  // 4. CIF Value
  const cifValueLkr = goodsCostLkr + freightCostLkr + insuranceCostLkr

  // 5. Customs Taxes
  const customsTaxesLkr = customsResult.totalTaxesLkr

  // 6. Total Landed Cost
  const totalLandedCostLkr = cifValueLkr + customsTaxesLkr + clearingChargesLkr + localTransportLkr
  const landedCostPerUnitLkr = Math.round(totalLandedCostLkr / Math.max(quantity, 1))

  // 7. Generate Scenarios
  // Optimistic: 10% lower FOB, optimistic freight (-15%), 5% lower clearing
  const optFobUsd = fobPriceUsd * 0.9
  const optGoodsLkr = Math.round(optFobUsd * quantity * exchangeRate)
  const optFreightLkr = Math.round(freightResult.rangeUsd.optimistic * exchangeRate)
  const optInsuranceLkr = Math.round((optGoodsLkr * insuranceRatePercent) / 100)
  const optCifLkr = optGoodsLkr + optFreightLkr + optInsuranceLkr
  // Approximate customs scale for optimistic
  const optCustomsTaxesLkr = Math.round(customsTaxesLkr * (optCifLkr / Math.max(cifValueLkr, 1)))
  const optTotalLandedLkr = optCifLkr + optCustomsTaxesLkr + Math.round(clearingChargesLkr * 0.95) + localTransportLkr

  const optimisticScenario: LandedCostScenario = {
    scenarioName: 'Optimistic',
    fobPriceUsd: optFobUsd,
    freightCostUsd: freightResult.rangeUsd.optimistic,
    insuranceCostUsd: Number((optInsuranceLkr / exchangeRate).toFixed(2)),
    cifLkr: optCifLkr,
    customsTaxesLkr: optCustomsTaxesLkr,
    clearingChargesLkr: Math.round(clearingChargesLkr * 0.95),
    localTransportLkr,
    totalLandedCostLkr: optTotalLandedLkr,
    landedCostPerUnitLkr: Math.round(optTotalLandedLkr / Math.max(quantity, 1)),
  }

  // Expected
  const expectedScenario: LandedCostScenario = {
    scenarioName: 'Expected',
    fobPriceUsd,
    freightCostUsd: freightResult.totalFreightUsd,
    insuranceCostUsd: Number(insuranceCostUsd.toFixed(2)),
    cifLkr: cifValueLkr,
    customsTaxesLkr,
    clearingChargesLkr,
    localTransportLkr,
    totalLandedCostLkr,
    landedCostPerUnitLkr,
  }

  // Conservative: 15% higher FOB, conservative freight (+25%), 20% higher clearing/transport
  const consFobUsd = fobPriceUsd * 1.15
  const consGoodsLkr = Math.round(consFobUsd * quantity * exchangeRate)
  const consFreightLkr = Math.round(freightResult.rangeUsd.conservative * exchangeRate)
  const consInsuranceLkr = Math.round((consGoodsLkr * insuranceRatePercent) / 100)
  const consCifLkr = consGoodsLkr + consFreightLkr + consInsuranceLkr
  const consCustomsTaxesLkr = Math.round(customsTaxesLkr * (consCifLkr / Math.max(cifValueLkr, 1)))
  const consTotalLandedLkr = consCifLkr + consCustomsTaxesLkr + Math.round(clearingChargesLkr * 1.2) + Math.round(localTransportLkr * 1.2)

  const conservativeScenario: LandedCostScenario = {
    scenarioName: 'Conservative',
    fobPriceUsd: consFobUsd,
    freightCostUsd: freightResult.rangeUsd.conservative,
    insuranceCostUsd: Number((consInsuranceLkr / exchangeRate).toFixed(2)),
    cifLkr: consCifLkr,
    customsTaxesLkr: consCustomsTaxesLkr,
    clearingChargesLkr: Math.round(clearingChargesLkr * 1.2),
    localTransportLkr: Math.round(localTransportLkr * 1.2),
    totalLandedCostLkr: consTotalLandedLkr,
    landedCostPerUnitLkr: Math.round(consTotalLandedLkr / Math.max(quantity, 1)),
  }

  return {
    quantity,
    unitWeightKg: freightResult.actualWeightKg / Math.max(quantity, 1),
    unitCbm: freightResult.totalCbm / Math.max(quantity, 1),
    exchangeRateUsed: exchangeRate,
    fxMode,
    goodsCostLkr,
    freightCostLkr,
    insuranceCostLkr,
    cifValueLkr,
    customsTaxesLkr,
    portClearingLkr: clearingChargesLkr,
    localTransportLkr,
    totalLandedCostLkr,
    landedCostPerUnitLkr,
    scenarios: {
      optimistic: optimisticScenario,
      expected: expectedScenario,
      conservative: conservativeScenario,
    },
  }
}
