import { MarginRoiResult } from '@/types/intelligence'

export interface CalculateMarginRoiInput {
  sellingPriceLkr: number
  landedCostPerUnitLkr: number
  quantity: number
  estimatedMonthlySalesUnits?: number
}

/**
 * Deterministic Financial Margin & ROI Calculation Engine.
 */
export function calculateMarginRoi(input: CalculateMarginRoiInput): MarginRoiResult {
  const { sellingPriceLkr, landedCostPerUnitLkr, quantity, estimatedMonthlySalesUnits = 50 } = input

  const grossProfitPerUnitLkr = sellingPriceLkr - landedCostPerUnitLkr
  const grossMarginPercent =
    sellingPriceLkr > 0 ? Number(((grossProfitPerUnitLkr / sellingPriceLkr) * 100).toFixed(2)) : 0

  const roiPercent =
    landedCostPerUnitLkr > 0
      ? Number(((grossProfitPerUnitLkr / landedCostPerUnitLkr) * 100).toFixed(2))
      : 0

  const totalInvestmentLkr = landedCostPerUnitLkr * quantity
  const capitalAtRiskLkr = totalInvestmentLkr

  const breakEvenUnits =
    grossProfitPerUnitLkr > 0 ? Math.ceil(totalInvestmentLkr / grossProfitPerUnitLkr) : quantity

  const inventoryRecoveryMonths =
    estimatedMonthlySalesUnits > 0
      ? Number((quantity / estimatedMonthlySalesUnits).toFixed(1))
      : 12

  return {
    sellingPriceLkr,
    landedCostPerUnitLkr,
    grossProfitPerUnitLkr,
    grossMarginPercent,
    roiPercent,
    totalInvestmentLkr,
    capitalAtRiskLkr,
    breakEvenUnits,
    inventoryRecoveryMonths,
  }
}
