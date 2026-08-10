'use client'

import type { Product } from '@/types'
import { OpportunityScore } from './OpportunityScore'
import { cn } from '@/lib/utils'

const SCORE_DIMENSIONS = [
  {
    key: 'scoreDemand',
    label: 'Demand / Virality',
    max: 20,
    desc: 'Social views, search volume, market traction',
  },
  {
    key: 'scoreMargin',
    label: 'Gross Margin Potential',
    max: 20,
    desc: 'Unit economics & price markup room',
  },
  {
    key: 'scoreCompetition',
    label: 'Sri Lanka Competition',
    max: 15,
    desc: 'Absence of saturated local sellers',
  },
  {
    key: 'scoreShipping',
    label: 'Shippability & Logistics',
    max: 10,
    desc: 'Size, weight, customs tariff risk',
  },
  {
    key: 'scoreBrandability',
    label: 'Private Label Potential',
    max: 10,
    desc: 'Custom packaging & brand building ease',
  },
  {
    key: 'scoreContent',
    label: 'Viral Content Appeal',
    max: 10,
    desc: 'Video demonstration & visual hook factor',
  },
  {
    key: 'scoreRepeatPurchase',
    label: 'Repeat Purchase / Consumable',
    max: 5,
    desc: 'Customer lifetime value potential',
  },
  {
    key: 'scoreRegulatory',
    label: 'Regulatory / Import Safety',
    max: 5,
    desc: 'Low import restrictions & compliance ease',
  },
  {
    key: 'scoreSupplier',
    label: 'Supplier Confidence',
    max: 5,
    desc: 'Factory responsiveness & sample quality',
  },
]

interface ScoreCardProps {
  product: Product
  onUpdate: (field: string, val: number) => void
}

export function ScoreCard({ product, onUpdate }: ScoreCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="eyebrow">Analytical Assessment</span>
          <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
            Opportunity Score Breakdown
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Calibrate 9 key dimensions to compute the total composite conviction score.
          </p>
        </div>

        <OpportunityScore score={product.score} size="lg" />
      </div>

      {/* Analytical Assessment Dimensions */}
      <div className="space-y-4">
        {SCORE_DIMENSIONS.map(dim => {
          const val = (product[dim.key as keyof Product] as number) || 0
          const pct = Math.min(100, Math.max(0, (val / dim.max) * 100))

          return (
            <div key={dim.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground">{dim.label}</span>
                  <span className="text-[11px] text-muted-foreground ml-2">
                    {dim.desc}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold">
                  <span className="text-foreground">{val}</span>
                  <span className="text-muted-foreground/60">/ {dim.max}</span>
                </div>
              </div>

              {/* Interactive track */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={dim.max}
                  value={val}
                  onChange={e => onUpdate(dim.key, parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
