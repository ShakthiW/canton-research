'use client'

import { calculateLandedCost } from '@/lib/engines/landed-cost-engine'
import { calculateMarginRoi } from '@/lib/engines/margin-roi-engine'
import { FreightCalculationResult } from '@/types/intelligence'
import { RiCalculatorLine, RiCurrencyLine } from '@remixicon/react'
import { useState } from 'react'

interface WhatIfCalculatorProps {
  initialFobPriceUsd?: number
  initialQuantity?: number
  initialSellingPriceLkr?: number
  initialFreight?: FreightCalculationResult
  exchangeRate?: number
}

export function WhatIfCalculator({
  initialFobPriceUsd = 3.5,
  initialQuantity = 100,
  initialSellingPriceLkr = 4490,
  initialFreight,
  exchangeRate = 305,
}: WhatIfCalculatorProps) {
  const [fobPriceUsd, setFobPriceUsd] = useState(initialFobPriceUsd)
  const [quantity, setQuantity] = useState(initialQuantity)
  const [sellingPriceLkr, setSellingPriceLkr] = useState(initialSellingPriceLkr)
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('USD')

  const isUsd = currency === 'USD'

  const dummyFreight: FreightCalculationResult = initialFreight || {
    mode: 'SEA_LCL',
    actualWeightKg: 45,
    totalCbm: 0.2,
    chargeableWeightKg: 45,
    pricingBasis: 'CBM',
    ratePerUnitUsd: 145,
    totalFreightUsd: 145,
    totalFreightLkr: 145 * exchangeRate,
    rangeUsd: { optimistic: 120, expected: 145, conservative: 180 },
    providerName: 'Planning Assumption',
    confidence: 0.8,
  }


  const dummyCustoms = {
    hsCode: '3926.90.90',
    cifValueLkr: (fobPriceUsd * quantity + dummyFreight.totalFreightUsd) * exchangeRate,
    customsDutyLkr: (fobPriceUsd * quantity * exchangeRate) * 0.15,
    palLkr: (fobPriceUsd * quantity * exchangeRate) * 0.1,
    cessLkr: (fobPriceUsd * quantity * exchangeRate) * 0.05,
    ssclLkr: (fobPriceUsd * quantity * exchangeRate) * 0.025,
    vatLkr: (fobPriceUsd * quantity * exchangeRate) * 0.18,
    exciseLkr: 0,
    sclLkr: 0,
    surchargeLkr: 0,
    fixedCustomsChargesLkr: 1600,
    totalTaxesLkr: Math.round((fobPriceUsd * quantity * exchangeRate) * 0.505),
    effectiveTaxRatePercent: 50.5,
    tariffVersion: '2026.01',
    explanations: [],
  }

  const landedCost = calculateLandedCost({
    quantity,
    fobPriceUsd,
    freightResult: dummyFreight,
    customsResult: dummyCustoms,
    exchangeRate,
    fxMode: 'CUSTOMS_FX',
  })

  const marginRoi = calculateMarginRoi({
    sellingPriceLkr,
    landedCostPerUnitLkr: landedCost.landedCostPerUnitLkr,
    quantity,
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <RiCalculatorLine className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Product Economics &quot;What If?&quot; Simulator
          </h3>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <RiCurrencyLine className="size-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              isUsd
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('LKR')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              !isUsd
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            LKR (Rs.)
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sliders Control Panel */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Supplier FOB Price ({isUsd ? 'USD' : 'LKR'})</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                {isUsd ? `$${fobPriceUsd.toFixed(2)}` : `Rs. ${Math.round(fobPriceUsd * exchangeRate).toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20.0"
              step="0.1"
              value={fobPriceUsd}
              onChange={(e) => setFobPriceUsd(parseFloat(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Order Quantity (Units)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{quantity} units</span>
            </div>
            <input
              type="range"
              min="50"
              max="2500"
              step="50"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Target Selling Price ({isUsd ? 'USD' : 'LKR'})</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                {isUsd
                  ? `$${(sellingPriceLkr / exchangeRate).toFixed(2)}`
                  : `Rs. ${sellingPriceLkr.toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="100"
              value={sellingPriceLkr}
              onChange={(e) => setSellingPriceLkr(parseInt(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Real-time Calculation Card */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 dark:border-indigo-900/30 dark:from-indigo-950/20 dark:to-purple-950/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Real-time Financial Outputs
          </h4>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase text-slate-400">Landed Cost / Unit</span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {isUsd
                  ? `$${(landedCost.landedCostPerUnitLkr / exchangeRate).toFixed(2)}`
                  : `LKR ${landedCost.landedCostPerUnitLkr.toLocaleString()}`}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400">Gross Margin</span>
              <p className={`text-lg font-bold font-mono ${marginRoi.grossMarginPercent > 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                {marginRoi.grossMarginPercent}%
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400">Gross Profit / Unit</span>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {isUsd
                  ? `$${(marginRoi.grossProfitPerUnitLkr / exchangeRate).toFixed(2)}`
                  : `LKR ${marginRoi.grossProfitPerUnitLkr.toLocaleString()}`}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-400">Break-even Sales</span>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {marginRoi.breakEvenUnits} units
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-indigo-200/50 pt-3 dark:border-indigo-800/50">
            <span className="text-[10px] uppercase text-slate-400">Total Capital Investment</span>
            <p className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {isUsd
                ? `$${Math.round(landedCost.totalLandedCostLkr / exchangeRate).toLocaleString()}`
                : `LKR ${landedCost.totalLandedCostLkr.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
