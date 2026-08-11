'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Validation, ProductListItem, ValidationResult } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createValidation } from '@/lib/actions/validation'
import { formatDate } from '@/lib/utils/time'
import { ProductPickerModal } from './ProductPickerModal'
import {
  RiCheckboxCircleLine,
  RiAddLine,
  RiLoader4Line,
  RiCheckLine,
  RiSparkling2Line,
  RiSearchLine,
  RiBox3Line,
  RiFlaskLine,
} from '@remixicon/react'
import { cn } from '@/lib/utils'

interface ValidationClientProps {
  validations: Validation[]
  products: ProductListItem[]
}

export function ValidationClient({ validations, products }: ValidationClientProps) {
  const [isAdding, setIsAdding] = useState(false)
  const productMap = new Map(products.map(p => [p._id, p]))

  const totalSpend = validations.reduce((acc, v) => acc + (v.adSpend || 0), 0)
  const totalOrders = validations.reduce((acc, v) => acc + (v.orders || 0), 0)
  const totalRevenue = validations.reduce((acc, v) => acc + (v.revenue || 0), 0)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Local Market Validation · Sri Lanka</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiCheckboxCircleLine className="size-6 text-emerald-600 dark:text-emerald-400" />
            Market Experiments & Pre-orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Test real customer willingness to pay via Meta / TikTok ad funnels and pre-orders before placing bulk import orders
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          onClick={() => setIsAdding(true)}
        >
          <RiAddLine className="size-4" />
          <span>Log Experiment</span>
        </Button>
      </div>

      {/* 2. Top Summary Intelligence Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="eyebrow">Tests Logged</span>
          <p className="text-2xl font-black font-mono text-primary mt-1">{validations.length}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="eyebrow">Total Ad Spend</span>
          <p className="text-2xl font-black font-mono text-muted-foreground mt-1">Rs. {totalSpend.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="eyebrow">Pre-orders Received</span>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{totalOrders}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="eyebrow">Generated Revenue</span>
          <p className="text-2xl font-black font-mono text-foreground mt-1">Rs. {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. Experiments Grid */}
      <div className="space-y-3">
        <span className="eyebrow block">Recorded Validation Runs</span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validations.map(test => {
            const product = productMap.get(test.productId)

            return (
              <div key={test._id} className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${test.productId}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors block"
                    >
                      {product?.name || 'Validated Product'}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {test.testMethod || 'Pre-order Test'} · {test.marketingChannel || 'Meta Ads'}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-bold uppercase',
                      test.result === 'Validated' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300' :
                      test.result === 'Promising' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300' :
                      test.result === 'Failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300' :
                      'bg-muted text-muted-foreground'
                    )}
                  >
                    {test.result}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/30 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">Ad Spend</span>
                    <span className="font-bold text-foreground">Rs. {(test.adSpend || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">Clicks</span>
                    <span className="font-bold text-foreground">{test.clicks || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">Pre-orders</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{test.orders || 0}</span>
                  </div>
                </div>

                {test.customerFeedback && (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded-xl border border-border/50">
                    &quot;{test.customerFeedback}&quot;
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>Tested {formatDate(test.createdAt)}</span>
                  {test.orders > 0 && test.adSpend > 0 && (
                    <span className="font-mono text-emerald-600 font-bold">
                      CPA: Rs. {Math.round(test.adSpend / test.orders).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {validations.length === 0 && (
            <div className="col-span-full p-12 text-center bg-card border border-border rounded-2xl space-y-3">
              <RiFlaskLine className="size-10 text-muted-foreground/50 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No Market Experiments Logged Yet</h3>
              <p className="text-xs text-muted-foreground">Log pre-order page results or Meta ad tests to validate Sri Lanka customer demand.</p>
              <Button onClick={() => setIsAdding(true)} className="text-xs font-bold gap-1.5 rounded-xl mx-auto mt-2">
                <RiAddLine className="size-4" />
                <span>Log Your First Experiment</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddExperimentModal
        open={isAdding}
        onOpenChange={setIsAdding}
        products={products}
      />
    </div>
  )
}

const TEST_METHODS = [
  'Pre-order Landing Page',
  'TikTok / Reels Ad Test',
  'Sample Feedback Survey',
  'Retail Popup',
]

const CHANNEL_PRESETS = ['Meta Ads', 'TikTok Ads', 'Instagram', 'Daraz', 'Google Search']

const VERDICTS: Array<{ id: ValidationResult; label: string; color: string }> = [
  { id: 'Validated', label: 'Validated ✅ (Bulk Ready)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' },
  { id: 'Promising', label: 'Promising 🔥 (More Testing)', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800' },
  { id: 'Interesting', label: 'Interesting 💡', color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800' },
  { id: 'Failed', label: 'Failed ❌ (Drop)', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800' },
]

function AddExperimentModal({
  open,
  onOpenChange,
  products,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  products: ProductListItem[]
}) {
  const [isPending, startTransition] = useTransition()
  const [pickerOpen, setPickerOpen] = useState(false)

  const [form, setForm] = useState({
    productId: '',
    testMethod: 'Pre-order Landing Page',
    marketingChannel: 'Meta Ads',
    adSpend: '',
    views: '',
    clicks: '',
    inquiries: '',
    orders: '',
    revenue: '',
    customerFeedback: '',
    result: 'Promising' as ValidationResult,
    notes: '',
  })

  function update(key: string, val: unknown) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const selectedProduct = products.find(p => p._id === form.productId)

  const cpa = form.adSpend && form.orders && parseInt(form.orders) > 0
    ? Math.round(parseFloat(form.adSpend) / parseInt(form.orders))
    : null

  function handleSave() {
    if (!form.productId) {
      toast.error('Please select a product from catalog')
      return
    }

    startTransition(async () => {
      try {
        await createValidation({
          productId: form.productId,
          testMethod: form.testMethod,
          marketingChannel: form.marketingChannel,
          adSpend: form.adSpend ? parseFloat(form.adSpend) : 0,
          views: form.views ? parseInt(form.views) : 0,
          clicks: form.clicks ? parseInt(form.clicks) : 0,
          inquiries: form.inquiries ? parseInt(form.inquiries) : 0,
          orders: form.orders ? parseInt(form.orders) : 0,
          revenue: form.revenue ? parseFloat(form.revenue) : 0,
          customerFeedback: form.customerFeedback,
          result: form.result,
          notes: form.notes,
        })
        toast.success('Validation test saved ✓')
        onOpenChange(false)
        setForm({
          productId: '',
          testMethod: 'Pre-order Landing Page',
          marketingChannel: 'Meta Ads',
          adSpend: '',
          views: '',
          clicks: '',
          inquiries: '',
          orders: '',
          revenue: '',
          customerFeedback: '',
          result: 'Promising',
          notes: '',
        })
      } catch {
        toast.error('Failed to log validation test')
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border shadow-2xl rounded-2xl">
          {/* Modal Header */}
          <div className="p-5 border-b border-border/80 bg-gradient-to-r from-emerald-50/50 via-background to-background dark:from-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <RiSparkling2Line className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">Log Sri Lanka Market Experiment</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Record ad spend, pre-orders, and local willingness to pay</p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Product Selection Box */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Product *
              </Label>

              {selectedProduct ? (
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                      {selectedProduct.imageUrl ? (
                        <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <RiBox3Line className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{selectedProduct.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedProduct.category} · Target ${selectedProduct.sellingPrice?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPickerOpen(true)}
                    className="h-9 px-3 text-xs font-bold rounded-xl shrink-0 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <RiSearchLine className="size-3.5" />
                    <span>Change Product</span>
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPickerOpen(true)}
                  className="w-full h-14 border-dashed border-2 border-primary/40 rounded-xl flex items-center justify-between px-4 text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <RiSearchLine className="size-4 text-primary" />
                    </div>
                    <span>Click to Browse & Select Product from Catalog *</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-primary/10 text-primary border-primary/20">
                    {products.length} Products
                  </Badge>
                </Button>
              )}
            </div>

            {/* 2. Test Method Pills */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Testing Method
              </Label>
              <div className="flex flex-wrap gap-2">
                {TEST_METHODS.map(m => {
                  const isSelected = form.testMethod === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update('testMethod', m)}
                      className={cn(
                        'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Marketing Channel with Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Marketing Channel
              </Label>
              <div className="space-y-2">
                <Input
                  value={form.marketingChannel}
                  onChange={e => update('marketingChannel', e.target.value)}
                  placeholder="e.g. Meta Ads (Facebook/Instagram), TikTok Ads"
                  className="h-11 text-xs font-medium rounded-xl"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-muted-foreground">Presets:</span>
                  {CHANNEL_PRESETS.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => update('marketingChannel', ch)}
                      className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/50"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Metrics Grid: Spend, Clicks, Pre-orders */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Performance Metrics
                </Label>
                {cpa !== null && (
                  <Badge variant="outline" className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border-emerald-300">
                    CPA: Rs. {cpa.toLocaleString()} / pre-order
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Ad Spend (LKR)</Label>
                  <Input
                    type="number"
                    value={form.adSpend}
                    onChange={e => update('adSpend', e.target.value)}
                    placeholder="e.g. 5000"
                    className="h-11 text-xs font-mono font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Ad Clicks</Label>
                  <Input
                    type="number"
                    value={form.clicks}
                    onChange={e => update('clicks', e.target.value)}
                    placeholder="e.g. 150"
                    className="h-11 text-xs font-mono font-semibold rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Pre-orders Received *</Label>
                  <Input
                    type="number"
                    value={form.orders}
                    onChange={e => update('orders', e.target.value)}
                    placeholder="e.g. 12"
                    className="h-11 text-xs font-mono font-bold rounded-xl text-emerald-600 border-emerald-300 dark:border-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* 5. Result Verdict Pills */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Validation Verdict
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VERDICTS.map(v => {
                  const isSelected = form.result === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => update('result', v.id)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs font-bold transition-all text-center',
                        isSelected
                          ? `${v.color} ring-2 ring-primary/40 shadow-xs`
                          : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {v.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 6. Customer Comments */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Objections & Feedback Notes
              </Label>
              <Textarea
                value={form.customerFeedback}
                onChange={e => update('customerFeedback', e.target.value)}
                placeholder="e.g. Customers asked for Cash on Delivery, mentioned Rs. 4,500 was slightly high..."
                rows={3}
                className="text-xs rounded-xl resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-4 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 px-6 text-xs font-bold gap-2 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all"
              onClick={handleSave}
              disabled={isPending || !form.productId}
            >
              {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
              <span>Save Experiment</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        products={products}
        selectedProductId={form.productId}
        onSelect={prod => update('productId', prod._id)}
      />
    </>
  )
}
