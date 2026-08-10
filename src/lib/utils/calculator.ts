import type { CalculatorInputs, CalculatorResults } from '@/types'

export function calculateLandedCost(inputs: CalculatorInputs): CalculatorResults {
  const {
    productCost,
    quantity,
    packagingCost,
    domesticShipping,
    internationalShipping,
    insurance,
    customsDuty,
    taxes,
    clearingFees,
    localTransport,
    otherCosts,
    sellingPrice,
  } = inputs

  const totalProductCost = productCost * quantity + packagingCost
  const totalShipping = domesticShipping + internationalShipping + insurance
  const totalDuties = customsDuty + taxes + clearingFees + localTransport
  const totalLandedCost = totalProductCost + totalShipping + totalDuties + otherCosts
  const landedCostPerUnit = quantity > 0 ? totalLandedCost / quantity : 0

  const grossRevenue = sellingPrice * quantity
  const grossProfit = grossRevenue - totalLandedCost
  const grossMarginPct = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0
  const roi = totalLandedCost > 0 ? (grossProfit / totalLandedCost) * 100 : 0
  const breakEvenUnits =
    sellingPrice > 0 && landedCostPerUnit > 0
      ? Math.ceil(totalLandedCost / sellingPrice)
      : 0

  return {
    totalProductCost,
    totalLandedCost,
    landedCostPerUnit,
    grossRevenue,
    grossProfit,
    grossMarginPct,
    roi,
    breakEvenUnits,
  }
}

export function calculateMarginPct(landedCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - landedCost) / sellingPrice) * 100
}

export function calculateLandedCostPerUnit(product: {
  chinaCost: number
  packagingCost: number
  shippingPerUnit: number
  customsPerUnit: number
  otherCosts: number
}): number {
  return (
    product.chinaCost +
    product.packagingCost +
    product.shippingPerUnit +
    product.customsPerUnit +
    product.otherCosts
  )
}
