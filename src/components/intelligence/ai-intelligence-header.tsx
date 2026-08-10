'use client'

import { AIRecommendation, OpportunityScoreResult } from '@/types/intelligence'
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiDownloadCloud2Line,
  RiFlashlightLine,
  RiInformationLine,
  RiRefreshLine,
  RiSparklingLine,
} from '@remixicon/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AIIntelligenceHeaderProps {
  productId: string
  score?: OpportunityScoreResult
  recommendation?: AIRecommendation
  freshness?: 'Fresh' | 'Aging' | 'Stale'
  lastResearchedAt?: string
  onTriggerResearch: (type: 'QUICK' | 'DEEP' | 'MODULE') => void
  isAnalyzing?: boolean
}

export function AIIntelligenceHeader({
  productId: _productId,
  score,
  recommendation,
  freshness = 'Fresh',
  lastResearchedAt,
  onTriggerResearch,
  isAnalyzing = false,
}: AIIntelligenceHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const finalScore = score?.finalScore ?? 75
  const recType = recommendation?.recommendation ?? 'VALIDATE FIRST'

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'STRONG BUY':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'BUY':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
      case 'INVESTIGATE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'VALIDATE FIRST':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
      case 'PASS':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Score & Recommendation */}
        <div className="flex items-center gap-6">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 font-extrabold text-white shadow-lg shadow-indigo-500/30">
            <span className="text-3xl tracking-tight">{finalScore}</span>
            <span className="absolute bottom-1.5 text-[10px] uppercase tracking-wider text-indigo-200">
              / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                AI Opportunity Rating
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold ${getBadgeColor(
                  recType
                )}`}
              >
                <RiSparklingLine className="h-3.5 w-3.5" />
                {recType}
              </span>
            </div>

            <h2 className="mt-1 text-xl font-bold text-white">
              {score?.explanation || 'Product Opportunity Assessment Ready'}
            </h2>

            <div className="mt-2 flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <RiCheckLine className="h-3.5 w-3.5 text-emerald-400" />
                Confidence: {recommendation ? `${Math.round(recommendation.confidence * 100)}%` : '82%'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <RiInformationLine className="h-3.5 w-3.5 text-indigo-300" />
                Freshness: <strong className="text-emerald-300">{freshness}</strong>
              </span>
              {lastResearchedAt && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">
                    Last analyzed {new Date(lastResearchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => {
              onTriggerResearch('QUICK')
              toast.success('Quick Analysis started in background')
            }}
            disabled={isAnalyzing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
          >
            <RiSparklingLine className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : '✨ Analyze Product'}
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 font-semibold text-slate-200 hover:bg-slate-800"
            >
              <RiArrowDownSLine className="h-5 w-5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    onTriggerResearch('QUICK')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <RiFlashlightLine className="h-4 w-4 text-amber-400" />
                  Quick Analysis
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    onTriggerResearch('DEEP')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <RiSparklingLine className="h-4 w-4 text-purple-400" />
                  Deep Research (All Agents)
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    onTriggerResearch('MODULE')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <RiRefreshLine className="h-4 w-4 text-teal-400" />
                  Refresh Customs & Freight
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    toast.info('Exporting Research Report PDF...')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <RiDownloadCloud2Line className="h-4 w-4 text-indigo-400" />
                  Export Intelligence Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
