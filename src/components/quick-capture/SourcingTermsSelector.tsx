'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  RiTimeLine,
  RiGiftLine,
  RiPriceTag3Line,
  RiBankCardLine,
  RiCheckLine,
} from '@remixicon/react'

interface SourcingTermsSelectorProps {
  leadTimeDays?: number
  samplesAvailable?: 'Free' | 'Paid' | 'No' | 'Not Discussed'
  sampleCost?: number
  customizationOptions?: string[]
  paymentTerms?: string
  onChange: (field: string, value: unknown) => void
}

const LEAD_TIME_PRESETS = [7, 15, 30, 45, 60]

const SAMPLE_OPTIONS: Array<{ id: 'Free' | 'Paid' | 'No' | 'Not Discussed'; label: string; badgeBg: string }> = [
  { id: 'Free', label: 'Free Sample', badgeBg: 'bg-emerald-500 text-white' },
  { id: 'Paid', label: 'Paid Sample', badgeBg: 'bg-indigo-500 text-white' },
  { id: 'No', label: 'No Samples', badgeBg: 'bg-rose-500 text-white' },
  { id: 'Not Discussed', label: 'Not Discussed', badgeBg: 'bg-slate-500 text-white' },
]

const CUSTOMIZATION_PRESETS = [
  { id: 'Custom Logo / OEM', label: '🏷️ Custom Logo / OEM' },
  { id: 'Custom Packaging', label: '📦 Custom Box / Pack' },
  { id: 'Custom Colors / Material', label: '🎨 Custom Color / Material' },
  { id: 'Custom Specs / Firmware', label: '⚙️ Custom Spec / Firmware' },
  { id: 'Custom Mold (ODM)', label: '🛠️ Custom Mold (ODM)' },
]

const PAYMENT_PRESETS = [
  '30% Deposit / 70% Balance',
  '100% T/T Advance',
  'LC at Sight',
  'Trade Assurance',
  'Negotiable',
]

export function SourcingTermsSelector({
  leadTimeDays,
  samplesAvailable = 'Not Discussed',
  sampleCost,
  customizationOptions = [],
  paymentTerms = '',
  onChange,
}: SourcingTermsSelectorProps) {

  function toggleCustomization(optId: string) {
    const current = [...customizationOptions]
    const index = current.indexOf(optId)
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(optId)
    }
    onChange('customizationOptions', current)
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <RiPriceTag3Line className="size-4" />
        <span>Sourcing & Trade Terms</span>
      </div>

      {/* 1. Production Lead Time (Phone keypad optimized) */}
      <div className="space-y-2 bg-background p-3.5 rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <RiTimeLine className="size-3.5 text-muted-foreground" />
            <span>Production Lead Time (Days)</span>
          </Label>
          <span className="text-[10px] text-muted-foreground font-mono">
            {leadTimeDays ? `${leadTimeDays} days` : 'Tap preset or type'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={leadTimeDays ?? ''}
            onChange={e => onChange('leadTimeDays', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="15"
            className="h-10 text-base font-bold font-mono w-24 rounded-lg text-center shrink-0"
          />

          {/* Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {LEAD_TIME_PRESETS.map(days => (
              <button
                key={days}
                type="button"
                onClick={() => onChange('leadTimeDays', days)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 touch-manipulation',
                  leadTimeDays === days
                    ? 'bg-primary text-primary-foreground border-primary shadow'
                    : 'bg-card hover:bg-muted text-muted-foreground border-border'
                )}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sample Availability & Sample Cost */}
      <div className="space-y-2.5 bg-background p-3.5 rounded-xl border border-border">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <RiGiftLine className="size-3.5 text-muted-foreground" />
          <span>Sample Availability & Cost</span>
        </Label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SAMPLE_OPTIONS.map(opt => {
            const isSelected = samplesAvailable === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange('samplesAvailable', opt.id)}
                className={cn(
                  'px-2.5 py-2 rounded-lg text-xs font-bold transition-all border text-center touch-manipulation',
                  isSelected
                    ? `${opt.badgeBg} border-transparent shadow-sm`
                    : 'bg-card hover:bg-muted text-muted-foreground border-border'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {samplesAvailable === 'Paid' && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
            <Label className="text-xs text-muted-foreground shrink-0">Sample Price ($ USD):</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={sampleCost ?? ''}
              onChange={e => onChange('sampleCost', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="25.00"
              className="h-9 text-xs font-bold font-mono w-28 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* 3. Whitelabeling & Customization Capabilities */}
      <div className="space-y-2 bg-background p-3.5 rounded-xl border border-border">
        <Label className="text-xs font-semibold">
          Whitelabeling & Customizations Offered
        </Label>

        <div className="flex flex-wrap gap-1.5">
          {CUSTOMIZATION_PRESETS.map(opt => {
            const isSelected = customizationOptions.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCustomization(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 touch-manipulation',
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-card hover:bg-muted text-foreground border-border'
                )}
              >
                {isSelected && <RiCheckLine className="size-3.5 shrink-0" />}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Payment Terms */}
      <div className="space-y-2 bg-background p-3.5 rounded-xl border border-border">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <RiBankCardLine className="size-3.5 text-muted-foreground" />
          <span>Payment Terms</span>
        </Label>

        <div className="flex flex-wrap gap-1.5">
          {PAYMENT_PRESETS.map(term => {
            const isSelected = paymentTerms === term
            return (
              <button
                key={term}
                type="button"
                onClick={() => onChange('paymentTerms', term)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border touch-manipulation',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold'
                    : 'bg-card hover:bg-muted text-muted-foreground border-border'
                )}
              >
                {term}
              </button>
            )
          })}
        </div>

        <Input
          value={paymentTerms}
          onChange={e => onChange('paymentTerms', e.target.value)}
          placeholder="Or type custom payment terms..."
          className="h-9 text-xs rounded-lg mt-1"
        />
      </div>
    </div>
  )
}
