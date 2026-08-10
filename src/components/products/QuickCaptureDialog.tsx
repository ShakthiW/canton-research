'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createProduct } from '@/lib/actions/products'
import { RiCheckLine, RiLoader4Line, RiArrowRightLine } from '@remixicon/react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Electronics', 'Home', 'Kitchen', 'Beauty', 'Automotive',
  'Travel', 'Fitness', 'Pets', 'Office', 'Lifestyle', 'Gifts', 'Other',
]

interface QuickCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickCaptureDialog({ open, onOpenChange }: QuickCaptureDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [lastProductId, setLastProductId] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    category: 'Other',
    chinaCost: '',
    moq: '',
    sellingPrice: '',
    boothNumber: '',
    supplierName: '',
    notes: '',
    sourcePlatform: 'Canton Fair',
  })

  function reset() {
    setForm({
      name: '',
      category: form.category, // remember last category
      chinaCost: '',
      moq: '',
      sellingPrice: '',
      boothNumber: form.boothNumber, // remember booth
      supplierName: form.supplierName, // remember supplier
      notes: '',
      sourcePlatform: 'Canton Fair',
    })
    setSaved(false)
    setLastProductId(null)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      nameRef.current?.focus()
      return
    }

    startTransition(async () => {
      try {
        const result = await createProduct({
          name: form.name.trim(),
          category: form.category,
          chinaCost: form.chinaCost ? parseFloat(form.chinaCost) : undefined,
          moq: form.moq ? parseInt(form.moq) : undefined,
          sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : undefined,
          boothNumber: form.boothNumber,
          supplierName: form.supplierName,
          notes: form.notes,
          sourcePlatform: form.sourcePlatform,
          status: 'Researching',
        })
        setLastProductId(result.id)
        setSaved(true)
        toast.success('Product captured ✓')
      } catch {
        toast.error("Couldn't save. Your data is still here. Retry.")
      }
    })
  }

  // Quick margin display
  const cost = parseFloat(form.chinaCost) || 0
  const sell = parseFloat(form.sellingPrice) || 0
  const estimatedLanded = cost * 1.4
  const margin = sell > 0 && estimatedLanded > 0 ? ((sell - estimatedLanded) / sell * 100).toFixed(0) : null

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) { onOpenChange(false); if (!saved) { /* nothing */ } } else onOpenChange(true) }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {saved ? (
          /* ─── Saved state ─── */
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <RiCheckLine className="size-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Product captured ✓</h3>
              <p className="text-sm text-muted-foreground mt-1">{form.name} has been saved.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={reset} className="w-full gap-2">
                <RiArrowRightLine className="size-4" />
                Capture another
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  if (lastProductId) router.push(`/products/${lastProductId}`)
                }}
              >
                Open product
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ─── Capture form ─── */
          <>
            <DialogHeader className="px-5 pt-5 pb-0">
              <DialogTitle className="text-base">Quick Capture</DialogTitle>
              <p className="text-xs text-muted-foreground">Canton Fair mode — capture in under 30 seconds</p>
            </DialogHeader>

            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {/* Product name */}
              <div className="space-y-1.5">
                <Label htmlFor="qc-name" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Product name *
                </Label>
                <Input
                  ref={nameRef}
                  id="qc-name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="What is this product?"
                  className="h-11 text-base"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && document.getElementById('qc-supplier')?.focus()}
                />
              </div>

              {/* Supplier + Booth */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qc-supplier" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Supplier
                  </Label>
                  <Input
                    id="qc-supplier"
                    value={form.supplierName}
                    onChange={e => update('supplierName', e.target.value)}
                    placeholder="Company name"
                    className="h-10"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('qc-booth')?.focus()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qc-booth" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Booth
                  </Label>
                  <Input
                    id="qc-booth"
                    value={form.boothNumber}
                    onChange={e => update('boothNumber', e.target.value)}
                    placeholder="e.g. A123"
                    className="h-10"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('qc-price')?.focus()}
                  />
                </div>
              </div>

              {/* Price + MOQ */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qc-price" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Price (USD)
                  </Label>
                  <Input
                    id="qc-price"
                    type="number"
                    value={form.chinaCost}
                    onChange={e => update('chinaCost', e.target.value)}
                    placeholder="0.00"
                    className="h-10"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('qc-moq')?.focus()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qc-moq" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    MOQ
                  </Label>
                  <Input
                    id="qc-moq"
                    type="number"
                    value={form.moq}
                    onChange={e => update('moq', e.target.value)}
                    placeholder="100"
                    className="h-10"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('qc-sell')?.focus()}
                  />
                </div>
              </div>

              {/* Sell price + category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qc-sell" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sell price (LKR)
                  </Label>
                  <Input
                    id="qc-sell"
                    type="number"
                    value={form.sellingPrice}
                    onChange={e => update('sellingPrice', e.target.value)}
                    placeholder="0"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </Label>
                  <Select value={form.category} onValueChange={(v: string | null) => { if (v) update('category', v) }}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live margin indicator */}
              {margin !== null && (
                <div className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium',
                  parseInt(margin) >= 50 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : parseInt(margin) >= 30 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                )}>
                  Est. margin ~{margin}% · Landed ≈ ${estimatedLanded.toFixed(2)}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quick note
                </Label>
                <Textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Key observations, quality notes, special features..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-3 flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isPending || !form.name.trim()}
                className="flex-1 gap-2"
              >
                {isPending ? (
                  <RiLoader4Line className="size-4 animate-spin" />
                ) : (
                  <RiCheckLine className="size-4" />
                )}
                {isPending ? 'Saving...' : 'Save Product'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
