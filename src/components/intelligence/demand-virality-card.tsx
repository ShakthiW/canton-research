'use client'

import { ProductIntelligenceState } from '@/types/intelligence'
import {
  RiFireLine,
  RiSparklingLine,
  RiStore2Line,
  RiVideoLine,
} from '@remixicon/react'
import { Button } from '@/components/ui/button'

interface DemandViralityCardProps {
  productName: string
  category: string
  tiktokViews?: number
  growthTrend?: string
  competitionLevel?: string
  competitorCount?: number
  sriLankanCompetitors?: string
  intelligence?: ProductIntelligenceState
  isAnalyzing?: boolean
  onTriggerResearch?: () => void
}

export function DemandViralityCard({
  productName,
  category,
  tiktokViews,
  growthTrend,
  competitionLevel,
  competitorCount,
  sriLankanCompetitors,
  intelligence,
  isAnalyzing,
  onTriggerResearch,
}: DemandViralityCardProps) {
  const socialVirality = intelligence?.socialVirality
  const competition = intelligence?.competition
  const demandResearch = intelligence?.demandResearch

  const hasIntelligence = Boolean(socialVirality || competition || demandResearch || intelligence?.lastResearchedAt)

  const priceDist = competition?.priceDistributionLkr
  const sellers = competition?.topLocalSellers || []
  const hooks = socialVirality?.hookIdeas || []

  return (
    <div className="space-y-5">
      {/* 1. Market Signals Top Strip */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div>
          <span className="eyebrow">Market Signals</span>
          <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
            Demand & Competition Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-border bg-background">
            <span className="eyebrow">TikTok Engagement</span>
            <p className="text-sm font-bold text-foreground mt-1">
              {hasIntelligence
                ? (tiktokViews && tiktokViews > 0 ? `${(tiktokViews / 1_000_000).toFixed(1)}M views` : 'Not tracked')
                : 'Pending AI Run'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Video discovery</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-background">
            <span className="eyebrow">Growth Trend</span>
            <p className={`text-sm font-bold mt-1 ${hasIntelligence && growthTrend === 'Viral' ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
              {hasIntelligence ? (growthTrend || 'Unknown') : 'Pending AI Run'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Social momentum</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-background">
            <span className="eyebrow">Local Competition</span>
            <p className="text-sm font-bold text-foreground mt-1">
              {hasIntelligence ? (competitionLevel || 'Low') : 'Pending AI Run'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sri Lanka market</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-background">
            <span className="eyebrow">Local Sellers</span>
            <p className="text-sm font-bold text-foreground mt-1">
              {hasIntelligence ? `${competitorCount ?? 0} sellers` : 'Pending AI Run'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Daraz / Instagram</p>
          </div>
        </div>

      </div>

      {/* 2. Empty State when AI Analysis has NOT been run */}
      {!hasIntelligence ? (
        <div className="rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-8 text-center space-y-3">
          <div className="size-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <RiSparklingLine className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              AI Market & Virality Analysis Pending
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Run AI analysis for &quot;{productName}&quot; to scan live Sri Lankan marketplace listings on Daraz, Ikman, and TikTok/Instagram for competitor pricing, viral hooks, and seller positioning.
            </p>
          </div>
          {onTriggerResearch && (
            <Button
              size="sm"
              onClick={onTriggerResearch}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow gap-1.5"
            >
              <RiSparklingLine className={`size-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Product...' : '✨ Run AI Market Analysis'}
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* 3. TikTok & Social Media Virality Hooks */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <RiVideoLine className="size-4 text-rose-500" />
              <h3 className="text-sm font-bold text-foreground">
                TikTok & Instagram Reels Content Virality Angles
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <RiFireLine className="size-3.5" /> High Demonstration Potential
                </div>
                <p className="text-xs text-muted-foreground">
                  {socialVirality?.ugcPotential || socialVirality?.demonstrationPotential || 'Visual transformation or problem-solving video appeal.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <RiSparklingLine className="size-3.5" /> Recommended Viral Hooks
                </div>
                {hooks.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-foreground font-mono">
                    {hooks.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">»</span>
                        <span>&quot;{h}&quot;</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No specific video hooks generated yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Sri Lanka Local Competitors & Price Distribution */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiStore2Line className="size-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Sri Lankan Local Marketplace Sellers & Price Distribution
                </h3>
              </div>

              {priceDist?.recommendedTargetPrice && (
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Target Sell: Rs. {priceDist.recommendedTargetPrice.toLocaleString()} LKR
                </span>
              )}
            </div>

            {/* Price Spectrum */}
            {priceDist ? (
              <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-muted-foreground">Lowest: Rs. {priceDist.lowestPrice.toLocaleString()}</span>
                  <span className="text-foreground">Median: Rs. {priceDist.medianPrice.toLocaleString()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Highest: Rs. {priceDist.highestPrice.toLocaleString()}</span>
                </div>

                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                  <div className="bg-amber-500 w-1/3" title="Budget Level" />
                  <div className="bg-emerald-500 w-1/3" title="Value / Target Level" />
                  <div className="bg-purple-500 w-1/3" title="Premium Level" />
                </div>
              </div>
            ) : null}

            {/* Seller List */}
            <div className="space-y-2">
              <span className="eyebrow">Active Local Sellers (Daraz.lk / Instagram)</span>
              {sellers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellers.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-background space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{s.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted">
                          {s.platform}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">{s.productName}</span>
                        <span className="font-bold text-foreground">Rs. {s.estimatedPriceLkr.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center border border-dashed rounded text-xs text-muted-foreground">
                  No active local competitors found on Daraz.lk or Ikman for this product.
                </div>
              )}
            </div>

            {sriLankanCompetitors && (
              <div className="p-3 rounded border border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
                <span className="eyebrow">Field Competitor Notes</span>
                <p>{sriLankanCompetitors}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
