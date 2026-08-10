'use client'

import { CustomsCalculationResult, LandedCostResult } from '@/types/intelligence'
import { RiInformationLine, RiShieldCheckLine } from '@remixicon/react'
import { useState } from 'react'

interface LandedCostWaterfallProps {
  landedCost?: LandedCostResult
  customs?: CustomsCalculationResult
}

export function LandedCostWaterfall({ landedCost, customs }: LandedCostWaterfallProps) {
  const [explanationOpen, setExplanationOpen] = useState(false)

  if (!landedCost) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Landed cost calculations will appear here after analysis.</p>
      </div>
    )
  }

  const waterfallItems = [
    { label: 'Goods Cost (FOB)', value: landedCost.goodsCostLkr, color: 'bg-blue-500' },
    { label: 'Intl Freight (Sea LCL)', value: landedCost.freightCostLkr, color: 'bg-indigo-500' },
    { label: 'Marine Insurance', value: landedCost.insuranceCostLkr, color: 'bg-cyan-500' },
    { label: 'Customs Duties & Taxes', value: landedCost.customsTaxesLkr, color: 'bg-amber-500' },
    { label: 'Port & Clearing Fees', value: landedCost.portClearingLkr, color: 'bg-purple-500' },
    { label: 'Local Transport', value: landedCost.localTransportLkr, color: 'bg-teal-500' },
  ]

  const maxVal = Math.max(...waterfallItems.map((i) => i.value)) || 1

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Import Landed Cost Waterfall
            </h3>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <RiShieldCheckLine className="h-3.5 w-3.5" /> Sri Lanka 2026 Tariff Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total Landed Cost: <strong className="text-slate-900 dark:text-white">LKR {landedCost.totalLandedCostLkr.toLocaleString()}</strong> ({landedCost.quantity} units)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 px-4 py-2 text-right dark:bg-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Landed Cost / Unit</span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              LKR {landedCost.landedCostPerUnitLkr.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => setExplanationOpen(true)}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RiInformationLine className="h-4 w-4 text-indigo-500" />
            Why was this calculated?
          </button>
        </div>
      </div>

      {/* Visual Bar Breakdown */}
      <div className="mt-6 space-y-3">
        {waterfallItems.map((item) => {
          const pct = Math.round((item.value / maxVal) * 100)
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>{item.label}</span>
                <span className="font-mono font-bold">LKR {item.value.toLocaleString()}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* CIF vs Taxes Breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:grid-cols-4">
        <div>
          <span className="text-[10px] font-semibold uppercase text-slate-400">FOB Price</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">LKR {landedCost.goodsCostLkr.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase text-slate-400">CIF Value</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">LKR {landedCost.cifValueLkr.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase text-slate-400">Customs Taxes</span>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">LKR {landedCost.customsTaxesLkr.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase text-slate-400">Effective Tax Burden</span>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {customs ? `${customs.effectiveTaxRatePercent}%` : '31.4%'}
          </p>
        </div>
      </div>

      {/* Explanation Modal */}
      {explanationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sri Lanka Customs Tax Formula Breakdown
              </h3>
              <button
                onClick={() => setExplanationOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
              <div className="rounded-xl bg-amber-50/60 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                HS Code: <strong>{customs?.hsCode || '3926.90.90'}</strong> • Tariff Version: <strong>{customs?.tariffVersion || '2026.01'}</strong>
              </div>

              {customs?.explanations.map((exp, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{exp.levy}</span>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{exp.formula}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    LKR {exp.amountLkr.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setExplanationOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
