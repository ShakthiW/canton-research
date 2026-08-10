'use client'

import { useState } from 'react'
import { LandedCostResult, CustomsCalculationResult, FreightCalculationResult } from '@/types/intelligence'
import { InlineEdit } from '../products/InlineEdit'
import { RiCurrencyLine } from '@remixicon/react'

interface UnitEconomicsBreakdownProps {
  chinaCostUsd?: number
  shippingPerUnitUsd?: number
  customsPerUnitUsd?: number
  landedCostLkr?: number
  landedCost?: LandedCostResult
  customs?: CustomsCalculationResult
  freight?: FreightCalculationResult
  exchangeRate?: number
  onEditField?: (field: string, val: string) => void
}

export function UnitEconomicsBreakdown({
  chinaCostUsd = 0,
  shippingPerUnitUsd = 0,
  customsPerUnitUsd = 0,
  landedCostLkr = 0,
  landedCost,
  customs,
  freight,
  exchangeRate = 325.0,
  onEditField,
}: UnitEconomicsBreakdownProps) {
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('USD')

  // Calculate accurate unit breakdown values
  const qty = landedCost?.quantity || 100

  // 1. Factory Cost per unit
  const fobUsd = chinaCostUsd || 0
  const fobLkr = fobUsd * exchangeRate

  // 2. Freight per unit
  const freightUsd = shippingPerUnitUsd || (freight ? freight.totalFreightUsd / qty : 0)
  const freightLkr = freightUsd * exchangeRate

  // 3. Customs Duty & Taxes per unit
  const customsDutyLkr = customs ? customs.totalTaxesLkr / qty : (customsPerUnitUsd ? customsPerUnitUsd * exchangeRate : 0)
  const customsDutyUsd = customsDutyLkr / exchangeRate

  // 4. Total Landed Cost per unit
  const totalLandedUsd = fobUsd + freightUsd + customsDutyUsd
  const totalLandedLkr = landedCostLkr || (landedCost ? landedCost.landedCostPerUnitLkr : totalLandedUsd * exchangeRate)

  const isUsd = currency === 'USD'

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Unit Landed Cost Flow</span>
          <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
            Unit Economics Breakdown
          </h2>
        </div>

        {/* Currency Switcher Toggle */}
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/60">
          <RiCurrencyLine className="size-3.5 text-muted-foreground ml-1.5" />
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              isUsd
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('LKR')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              !isUsd
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            LKR (Rs.)
          </button>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
        <span>Customs Valuation Rate:</span>
        <span className="font-bold text-foreground">1 USD = Rs. {exchangeRate.toFixed(2)} LKR</span>
      </div>

      {/* Horizontal Step-by-step Flow with Exact Addition */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center text-center">
        {/* Step 1: Factory Cost */}
        <div className="p-3 rounded-lg border border-border bg-background text-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            1. Factory Cost
          </span>
          <div className="text-base font-bold font-mono text-foreground mt-0.5">
            {isUsd ? (
              onEditField ? (
                <InlineEdit
                  value={fobUsd}
                  onSave={(v) => onEditField('chinaCost', v)}
                  type="number"
                  prefix="$"
                  placeholder="0.00"
                  displayClassName="text-base font-bold font-mono"
                />
              ) : (
                `$${fobUsd.toFixed(2)}`
              )
            ) : (
              `Rs. ${Math.round(fobLkr).toLocaleString()}`
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center font-bold text-muted-foreground text-sm">
          +
        </div>

        {/* Step 2: Shipping / Unit */}
        <div className="p-3 rounded-lg border border-border bg-background text-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            2. Shipping / Unit
          </span>
          <div className="text-base font-bold font-mono text-foreground mt-0.5">
            {isUsd ? (
              onEditField ? (
                <InlineEdit
                  value={freightUsd}
                  onSave={(v) => onEditField('shippingPerUnit', v)}
                  type="number"
                  prefix="$"
                  placeholder="0.00"
                  displayClassName="text-base font-bold font-mono"
                />
              ) : (
                `$${freightUsd.toFixed(2)}`
              )
            ) : (
              `Rs. ${Math.round(freightLkr).toLocaleString()}`
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center font-bold text-muted-foreground text-sm">
          +
        </div>

        {/* Step 3: Customs Duty & Taxes */}
        <div className="p-3 rounded-lg border border-border bg-background text-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            3. Customs Duty
          </span>
          <div className="text-base font-bold font-mono text-foreground mt-0.5">
            {isUsd ? (
              onEditField ? (
                <InlineEdit
                  value={customsDutyUsd}
                  onSave={(v) => onEditField('customsPerUnit', v)}
                  type="number"
                  prefix="$"
                  placeholder="0.00"
                  displayClassName="text-base font-bold font-mono"
                />
              ) : (
                `$${customsDutyUsd.toFixed(2)}`
              )
            ) : (
              `Rs. ${Math.round(customsDutyLkr).toLocaleString()}`
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center font-bold text-muted-foreground text-sm">
          =
        </div>

        {/* Step 4: Total Landed Cost Result */}
        <div className="p-3 rounded-lg border-2 border-primary/40 bg-primary/5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Landed Cost
          </span>
          <p className="text-lg font-black font-mono text-primary mt-0.5">
            {isUsd ? `$${totalLandedUsd.toFixed(2)}` : `Rs. ${Math.round(totalLandedLkr).toLocaleString()}`}
          </p>
        </div>
      </div>
    </div>
  )
}
