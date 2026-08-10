'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateLandedCost } from '@/lib/utils/calculator'
import type { CalculatorInputs, CalculatorResults } from '@/types'
import { cn } from '@/lib/utils'
import { RiCalculatorLine, RiRefreshLine, RiMoneyDollarCircleLine, RiTruckLine, RiShieldLine, RiPieChartLine } from '@remixicon/react'

const DEFAULTS: CalculatorInputs = {
  productCost: 3.5,
  quantity: 500,
  currency: 'USD',
  packagingCost: 0.5,
  domesticShipping: 0.3,
  internationalShipping: 1.2,
  insurance: 0.1,
  customsDuty: 0.8,
  taxes: 0.4,
  clearingFees: 0.2,
  localTransport: 0.3,
  otherCosts: 0.1,
  sellingPrice: 16.0,
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULTS)
  const [results, setResults] = useState<CalculatorResults>(() => calculateLandedCost(DEFAULTS))

  function update(key: keyof CalculatorInputs, value: string) {
    const updated = {
      ...inputs,
      [key]: key === 'currency' ? value : (parseFloat(value) || 0),
    }
    setInputs(updated)
    setResults(calculateLandedCost(updated))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResults(calculateLandedCost(DEFAULTS))
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Financial Modeling Terminal</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiCalculatorLine className="size-6 text-primary" />
            Landed Cost & Profit Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Simulate complete container and air freight unit economics, customs tariffs, Sri Lanka duties, and ROI
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={reset} className="gap-1.5 text-xs">
          <RiRefreshLine className="size-3.5" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      {/* 2. Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section 1: Factory & Order */}
          <Section title="1. Factory Cost & Order Volume" icon={<RiMoneyDollarCircleLine className="size-4 text-primary" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Unit Factory Price ($)" value={inputs.productCost} onChange={v => update('productCost', v)} prefix="$" />
              <Field label="Order Volume (Units)" value={inputs.quantity} onChange={v => update('quantity', v)} />
              <Field label="Custom Packaging / Unit" value={inputs.packagingCost} onChange={v => update('packagingCost', v)} prefix="$" />
            </div>
          </Section>

          {/* Section 2: Freight & Logistics */}
          <Section title="2. Freight & Transit" icon={<RiTruckLine className="size-4 text-blue-500" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="China Domestic / Unit" value={inputs.domesticShipping} onChange={v => update('domesticShipping', v)} prefix="$" />
              <Field label="Intl Freight / Unit" value={inputs.internationalShipping} onChange={v => update('internationalShipping', v)} prefix="$" />
              <Field label="Cargo Insurance / Unit" value={inputs.insurance} onChange={v => update('insurance', v)} prefix="$" />
            </div>
          </Section>

          {/* Section 3: Customs & Port */}
          <Section title="3. Customs & Port Clearance" icon={<RiShieldLine className="size-4 text-purple-500" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Customs Duty / Unit" value={inputs.customsDuty} onChange={v => update('customsDuty', v)} prefix="$" />
              <Field label="Import VAT / Unit" value={inputs.taxes} onChange={v => update('taxes', v)} prefix="$" />
              <Field label="Port Clearance / Unit" value={inputs.clearingFees} onChange={v => update('clearingFees', v)} prefix="$" />
            </div>
          </Section>

          {/* Section 4: Revenue & Retail */}
          <Section title="4. Local Retail Pricing" icon={<RiPieChartLine className="size-4 text-emerald-500" />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Local Transport / Unit" value={inputs.localTransport} onChange={v => update('localTransport', v)} prefix="$" />
              <Field label="Target Retail Price / Unit ($)" value={inputs.sellingPrice} onChange={v => update('sellingPrice', v)} prefix="$" />
            </div>
          </Section>
        </div>

        {/* Right: Live Financial Terminal Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border-2 border-primary/40 bg-card p-5 space-y-5 shadow-xs">
            {/* Top Landed Cost Block */}
            <div className="text-center pb-4 border-b border-border">
              <span className="eyebrow">Target Landed Cost / Unit</span>
              <p className="text-4xl font-black font-mono text-primary mt-1">
                ${results.landedCostPerUnit.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ≈ LKR {(results.landedCostPerUnit * 305).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Profit & Margin Block */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded bg-muted/40 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Unit Gross Profit
                </span>
                <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${(inputs.sellingPrice - results.landedCostPerUnit).toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded bg-muted/40 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Gross Margin
                </span>
                <p className={cn(
                  'text-xl font-black font-mono mt-0.5',
                  results.grossMarginPct >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                )}>
                  {results.grossMarginPct.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Batch Metrics */}
            <div className="space-y-2 pt-2 border-t border-border text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Batch Quantity:</span>
                <span className="font-bold">{inputs.quantity.toLocaleString()} units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Landed Investment:</span>
                <span className="font-bold">${results.totalLandedCost.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gross Expected Revenue:</span>
                <span className="font-bold">${results.grossRevenue.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Gross Profit:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${results.grossProfit.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Return on Investment (ROI):</span>
                <span className="font-bold text-primary">{results.roi.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Break-Even Point:</span>
                <span className="font-bold">{results.breakEvenUnits.toLocaleString()} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground font-medium">{label}</Label>
      <Input
        type="number"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="h-9 text-xs font-mono font-semibold bg-background"
        placeholder="0.00"
      />
    </div>
  )
}
