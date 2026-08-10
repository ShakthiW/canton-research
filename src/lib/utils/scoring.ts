import type { Product } from '@/types'

export interface ScoreComponents {
  scoreDemand: number      // 0–20
  scoreMargin: number      // 0–20
  scoreCompetition: number // 0–15
  scoreShipping: number    // 0–10
  scoreBrandability: number // 0–10
  scoreContent: number     // 0–10
  scoreRepeatPurchase: number // 0–5
  scoreRegulatory: number  // 0–5
  scoreSupplier: number    // 0–5
}

export function calculateTotalScore(components: ScoreComponents): number {
  return Math.min(
    100,
    Math.max(
      0,
      components.scoreDemand +
        components.scoreMargin +
        components.scoreCompetition +
        components.scoreShipping +
        components.scoreBrandability +
        components.scoreContent +
        components.scoreRepeatPurchase +
        components.scoreRegulatory +
        components.scoreSupplier
    )
  )
}

export type ScoreCategory =
  | 'Exceptional'
  | 'Strong'
  | 'Promising'
  | 'Needs Validation'
  | 'Weak'

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'Exceptional'
  if (score >= 80) return 'Strong'
  if (score >= 70) return 'Promising'
  if (score >= 60) return 'Needs Validation'
  return 'Weak'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 70) return 'text-amber-600 dark:text-amber-400'
  if (score >= 60) return 'text-orange-500 dark:text-orange-400'
  return 'text-red-500 dark:text-red-400'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 70) return 'bg-amber-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

export function autoCalculateScore(product: Partial<Product>): Partial<ScoreComponents> {
  const components: Partial<ScoreComponents> = {}

  // Auto-score margin (0–20)
  if (product.landedCost && product.sellingPrice && product.sellingPrice > 0) {
    const margin =
      ((product.sellingPrice - product.landedCost) / product.sellingPrice) * 100
    if (margin >= 70) components.scoreMargin = 20
    else if (margin >= 60) components.scoreMargin = 17
    else if (margin >= 50) components.scoreMargin = 14
    else if (margin >= 40) components.scoreMargin = 10
    else if (margin >= 30) components.scoreMargin = 6
    else components.scoreMargin = 2
  }

  // Auto-score demand based on trend
  if (product.growthTrend) {
    const demandMap: Record<string, number> = {
      Viral: 20,
      Growing: 16,
      Emerging: 13,
      Stable: 10,
      Declining: 4,
      Unknown: 7,
    }
    components.scoreDemand = demandMap[product.growthTrend] ?? 7
  }

  // Auto-score competition
  if (product.competitionLevel) {
    const compMap: Record<string, number> = {
      Low: 15,
      Medium: 10,
      High: 5,
      Saturated: 2,
      Unknown: 7,
    }
    components.scoreCompetition = compMap[product.competitionLevel] ?? 7
  }

  return components
}
