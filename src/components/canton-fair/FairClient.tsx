'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import type { Fair, FairVisit, Supplier, ProductListItem, BoothInterestLevel } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createFairVisit } from '@/lib/actions/fair'
import { formatDate } from '@/lib/utils/time'
import {
  RiFlashlightLine,
  RiCheckLine,
  RiLoader4Line,
  RiStore2Line,
  RiStarLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiHistoryLine,
} from '@remixicon/react'
import { cn } from '@/lib/utils'

const INTEREST_OPTIONS: Array<{ level: BoothInterestLevel; label: string; dot: string }> = [
  { level: 'Shortlisted', label: '★ Shortlisted (High Priority)', dot: 'bg-amber-500' },
  { level: 'Interesting', label: 'Interesting Opportunity', dot: 'bg-blue-500' },
  { level: 'Follow Up', label: 'Needs Follow Up', dot: 'bg-purple-500' },
  { level: 'Rejected', label: 'Pass / Not Viable', dot: 'bg-rose-500' },
]

interface FairClientProps {
  fairs: Fair[]
  visits: FairVisit[]
  suppliers: Supplier[]
  products: ProductListItem[]
}

export function FairClient({ fairs, visits, suppliers, products }: FairClientProps) {
  const [isPending, startTransition] = useTransition()
  const [successPing, setSuccessPing] = useState(false)
  const productInputRef = useRef<HTMLInputElement>(null)

  const activeFair = fairs[0] || {
    name: '140th Canton Fair',
    location: 'Guangzhou, China',
    phase: 'Phase 1',
  }

  // Fast capture form state
  const [form, setForm] = useState({
    boothNumber: '',
    hall: 'Hall 1.1',
    productName: '',
    supplierName: '',
    priceQuoted: '',
    moq: '',
    contactInfo: '',
    notes: '',
    interestLevel: 'Shortlisted' as BoothInterestLevel,
  })

  function update(key: string, val: unknown) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function handleFastCapture() {
    if (!form.boothNumber.trim()) {
      toast.error('Please enter Booth #')
      return
    }
    if (!form.productName.trim() && !form.supplierName.trim()) {
      toast.error('Please enter Product or Supplier name')
      return
    }

    startTransition(async () => {
      try {
        await createFairVisit({
          fairId: activeFair._id || '',
          boothNumber: form.boothNumber.trim(),
          hall: form.hall.trim(),
          productName: form.productName.trim(),
          supplierName: form.supplierName.trim(),
          priceQuoted: form.priceQuoted ? parseFloat(form.priceQuoted) : undefined,
          moq: form.moq ? parseInt(form.moq) : undefined,
          contactInfo: form.contactInfo.trim(),
          notes: form.notes.trim(),
          interestLevel: form.interestLevel,
          followUpRequired: form.interestLevel === 'Follow Up' || form.interestLevel === 'Shortlisted',
        })

        // Success micro-feedback & instant auto-reset for next booth
        setSuccessPing(true)
        setTimeout(() => setSuccessPing(false), 2000)

        // Clear product & price while keeping hall/booth prefix for speed
        setForm(prev => ({
          ...prev,
          productName: '',
          priceQuoted: '',
          moq: '',
          notes: '',
          interestLevel: 'Shortlisted',
        }))

        // Auto-focus back on product name
        setTimeout(() => productInputRef.current?.focus(), 50)
        toast.success('Booth visit captured ✓')
      } catch {
        toast.error('Failed to save booth visit')
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
      {/* 1. Fair Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Field Operations · China</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiFlashlightLine className="size-6 text-emerald-600 dark:text-emerald-400" />
            {activeFair.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {activeFair.location} · {activeFair.phase} · High-speed booth intelligence logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
              Booths Visited
            </span>
            <p className="text-xl font-black font-mono text-foreground">
              {visits.length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Cockpit: Fast Walking Capture (Top) + Recent Captures (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): High-Speed Capture Console */}
        <div className="lg:col-span-7 rounded-lg border-2 border-primary/30 bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="eyebrow">Walking Console</span>
              <h2 className="text-base font-bold text-foreground mt-0.5">
                Fast Booth Capture
              </h2>
            </div>
            {successPing && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                <RiCheckLine className="size-4" /> Captured ✓
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Booth & Hall */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Booth # *
                </Label>
                <Input
                  value={form.boothNumber}
                  onChange={e => update('boothNumber', e.target.value)}
                  placeholder="e.g. 5.1 F22"
                  className="h-11 text-sm font-bold uppercase tracking-wide bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hall
                </Label>
                <Input
                  value={form.hall}
                  onChange={e => update('hall', e.target.value)}
                  placeholder="Hall 5.1"
                  className="h-11 text-sm bg-background"
                />
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Product Name / Hook *
              </Label>
              <Input
                ref={productInputRef}
                value={form.productName}
                onChange={e => update('productName', e.target.value)}
                placeholder="e.g. Magnetic Cable Management System"
                className="h-12 text-base font-semibold bg-background"
                autoFocus
              />
            </div>

            {/* Quoted Price & MOQ */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quoted Unit Price (USD)
                </Label>
                <Input
                  type="number"
                  value={form.priceQuoted}
                  onChange={e => update('priceQuoted', e.target.value)}
                  placeholder="0.00"
                  className="h-11 text-base font-mono font-bold bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  MOQ (Units)
                </Label>
                <Input
                  type="number"
                  value={form.moq}
                  onChange={e => update('moq', e.target.value)}
                  placeholder="100"
                  className="h-11 text-base font-mono bg-background"
                />
              </div>
            </div>

            {/* Supplier & Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Supplier / Company
                </Label>
                <Input
                  value={form.supplierName}
                  onChange={e => update('supplierName', e.target.value)}
                  placeholder="Factory name"
                  className="h-10 text-xs bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  WeChat ID / Phone
                </Label>
                <Input
                  value={form.contactInfo}
                  onChange={e => update('contactInfo', e.target.value)}
                  placeholder="WeChat ID"
                  className="h-10 text-xs bg-background"
                />
              </div>
            </div>

            {/* Interest Level */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Conviction / Interest Level
              </Label>
              <Select
                value={form.interestLevel}
                onValueChange={(v: string | null) => {
                  if (v) update('interestLevel', v as BoothInterestLevel)
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-background font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTEREST_OPTIONS.map(opt => (
                    <SelectItem key={opt.level} value={opt.level} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Field Observations / Quality Note
              </Label>
              <Textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Material quality, packaging options, sample willingness, OEM terms..."
                rows={2}
                className="text-xs bg-background resize-none"
              />
            </div>
          </div>

          {/* Large Primary Action */}
          <Button
            size="lg"
            className="w-full h-12 text-sm font-bold tracking-wide uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={handleFastCapture}
            disabled={isPending}
          >
            {isPending ? (
              <RiLoader4Line className="size-5 animate-spin" />
            ) : (
              <RiCheckLine className="size-5 mr-1" />
            )}
            {isPending ? 'Logging...' : 'Capture Booth Product'}
          </Button>
        </div>

        {/* Right (5 cols): Live Stream of Fair Captures */}
        <div className="lg:col-span-5 rounded-lg border border-border bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <span className="eyebrow">Floor Stream</span>
              <h2 className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <RiHistoryLine className="size-4 text-primary" />
                Recent Floor Captures
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {visits.length} Total
            </span>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[560px] scrollbar-thin">
            {visits.map((visit, idx) => (
              <div
                key={visit._id}
                className="p-3.5 hover:bg-muted/30 transition-colors cockpit-row space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground/60">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono font-bold text-xs bg-muted px-1.5 py-0.5 rounded">
                      {visit.boothNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {visit.hall}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                      visit.interestLevel === 'Shortlisted'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {visit.interestLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  {visit.priceQuoted > 0 && (
                    <span>
                      Quoted: <strong className="text-primary">${visit.priceQuoted}</strong>
                    </span>
                  )}
                  {visit.moq > 0 && <span>MOQ: {visit.moq}</span>}
                </div>

                {visit.notes && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/30 p-1.5 rounded">
                    {visit.notes}
                  </p>
                )}
              </div>
            ))}

            {visits.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No floor captures recorded yet. Start capturing above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
