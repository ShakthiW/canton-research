import { OpportunityScoreResult, ScoreConfiguration } from '@/types/intelligence'

export const DEFAULT_SCORE_CONFIG: ScoreConfiguration = {
  id: 'default',
  name: 'Balanced Model',
  weights: {
    demand: 20,
    margin: 20,
    competition: 10,
    shipping: 10,
    supplier: 10,
    content: 10,
    marketGap: 10,
    regulatory: 5,
    capital: 5,
  },
  isDefault: true,
}

export interface CalculateScoreInput {
  demandScore: number // 0-100
  grossMarginPercent: number
  competitorCount: number
  shippingToLandedRatio: number // shippingCost / totalLandedCost
  supplierConfidence: number // 0-1
  contentPotentialScore: number // 0-100
  marketGapScore: number // 0-100
  isRegulatoryRestricted: boolean
  totalInvestmentLkr: number
  config?: ScoreConfiguration
  manualAdjustment?: number
}

/**
 * Deterministic Opportunity Scoring Engine (0-100).
 * Never allow LLMs to directly output the final numerical score.
 */
export function calculateOpportunityScore(input: CalculateScoreInput): OpportunityScoreResult {
  const {
    demandScore,
    grossMarginPercent,
    competitorCount,
    shippingToLandedRatio,
    supplierConfidence,
    contentPotentialScore,
    marketGapScore,
    isRegulatoryRestricted,
    totalInvestmentLkr,
    config = DEFAULT_SCORE_CONFIG,
    manualAdjustment = 0,
  } = input

  // Normalize components to 0-100 scale

  // 1. Demand (0-100)
  const normDemand = Math.min(100, Math.max(0, demandScore))

  // 2. Margin (0-100): 65%+ margin = 100, 0% = 0
  const normMargin = Math.min(100, Math.max(0, Math.round((grossMarginPercent / 65) * 100)))

  // 3. Competition (0-100): Inverted. 0 competitors = 100, 15+ competitors = 10
  const normCompetition = Math.max(10, Math.round(100 - competitorCount * 6))

  // 4. Shipping Efficiency (0-100): Lower shipping ratio is better. <10% = 100, >50% = 20
  const normShipping = Math.max(20, Math.round(100 - shippingToLandedRatio * 160))

  // 5. Supplier Confidence (0-100)
  const normSupplier = Math.min(100, Math.max(0, Math.round(supplierConfidence * 100)))

  // 6. Content Potential (0-100)
  const normContent = Math.min(100, Math.max(0, contentPotentialScore))

  // 7. Market Gap (0-100)
  const normMarketGap = Math.min(100, Math.max(0, marketGapScore))

  // 8. Regulatory (0-100): 100 if simple, 20 if restricted
  const normRegulatory = isRegulatoryRestricted ? 20 : 95

  // 9. Capital Requirement (0-100): Inverted risk. < LKR 100k = 100, > LKR 2M = 30
  const normCapital = Math.max(30, Math.round(100 - (totalInvestmentLkr / 2_000_000) * 70))

  const components = {
    demand: normDemand,
    margin: normMargin,
    competition: normCompetition,
    shipping: normShipping,
    supplier: normSupplier,
    content: normContent,
    marketGap: normMarketGap,
    regulatory: normRegulatory,
    capital: normCapital,
  }

  // Weighted Sum Calculation
  const w = config.weights
  const totalWeight =
    w.demand +
    w.margin +
    w.competition +
    w.shipping +
    w.supplier +
    w.content +
    w.marketGap +
    w.regulatory +
    w.capital

  const rawScore =
    (normDemand * w.demand +
      normMargin * w.margin +
      normCompetition * w.competition +
      normShipping * w.shipping +
      normSupplier * w.supplier +
      normContent * w.content +
      normMarketGap * w.marketGap +
      normRegulatory * w.regulatory +
      normCapital * w.capital) /
    (totalWeight || 100)

  const aiScore = Math.round(Math.min(100, Math.max(0, rawScore)))
  const finalScore = Math.round(Math.min(100, Math.max(0, aiScore + manualAdjustment)))

  // Positive Factors & Top Risks
  const positiveFactors: string[] = []
  const topRisks: string[] = []

  if (normMargin >= 75) positiveFactors.push(`High Gross Margin (${grossMarginPercent}%)`)
  if (normDemand >= 75) positiveFactors.push(`Strong Market Demand (${demandScore}/100)`)
  if (normCompetition >= 75) positiveFactors.push(`Low Sri Lankan Competitor Density (${competitorCount} sellers)`)
  if (normMarketGap >= 75) positiveFactors.push(`Clear Local Market Gap (${marketGapScore}/100)`)

  if (normMargin < 40) topRisks.push(`Low Profit Margin (${grossMarginPercent}%)`)
  if (normCompetition < 40) topRisks.push(`High Local Competition (${competitorCount} existing sellers)`)
  if (normShipping < 40) topRisks.push(`High Freight Ratio (${Math.round(shippingToLandedRatio * 100)}% of landed cost)`)
  if (isRegulatoryRestricted) topRisks.push(`Customs & Regulatory Import Controls apply`)

  const explanation = `Score ${finalScore}/100 calculated from ${grossMarginPercent}% gross margin, ${demandScore}/100 demand rating, and ${competitorCount} local competitors.`

  return {
    aiScore,
    manualAdjustment,
    finalScore,
    components,
    explanation,
    positiveFactors,
    topRisks,
    calculatedAt: new Date().toISOString(),
  }
}
