'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { Validation, ProductListItem, ValidationResult } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createValidation } from '@/lib/actions/validation'
import { formatDate } from '@/lib/utils/time'
import {
  RiCheckboxCircleLine,
  RiAddLine,
  RiLoader4Line,
  RiCheckLine,
  RiSparkling2Line,
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
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
        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">Tests Logged</span>
          <p className="text-2xl font-black font-mono text-primary mt-1">{validations.length}</p>
        </div>
        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">Total Ad Spend</span>
          <p className="text-2xl font-black font-mono text-muted-foreground mt-1">Rs. {totalSpend.toLocaleString()}</p>
        </div>
        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">Pre-orders Received</span>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{totalOrders}</p>
        </div>
        <div className="p-3.5 rounded-lg border border-border bg-card">
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
              <div key={test._id} className="rounded-lg border border-border bg-card p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${test.productId}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors block"
                    >
                      {product?.name || 'Validated Product'}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {test.testMethod} · {test.marketingChannel} · {formatDate(test.testDate)}
                    </p>
                  </div>

                  <span className={cn(
                    'text-xs font-bold uppercase px-2 py-0.5 rounded',
                    test.result === 'Validated' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                  )}>
                    {test.result}
                  </span>
                </div>

                {/* Funnel strip */}
                <div className="grid grid-cols-4 gap-2 bg-muted/40 p-2 rounded border border-border/50 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase">Spend</span>
                    <p className="text-xs font-bold mt-0.5">Rs. {test.adSpend}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase">Clicks</span>
                    <p className="text-xs font-bold mt-0.5">{test.clicks}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase">Orders</span>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{test.orders}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase">Conv.</span>
                    <p className="text-xs font-bold mt-0.5">{test.conversionRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>

                {test.customerFeedback && (
                  <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                    <strong>Customer signals:</strong> {test.customerFeedback}
                  </p>
                )}
              </div>
            )
          })}

          {validations.length === 0 && (
            <div className="col-span-full p-16 text-center border rounded-lg bg-card">
              <span className="eyebrow block">No experiments run yet</span>
              <p className="text-xs text-muted-foreground mt-1">
                Log ad test metrics and customer feedback to validate product demand in Sri Lanka.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddValidationDialog products={products} open={isAdding} onOpenChange={setIsAdding} />
    </div>
  )
}

function AddValidationDialog({
  products,
  open,
  onOpenChange,
}: {
  products: ProductListItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    productId: products[0]?._id || '',
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

  function handleSave() {
    if (!form.productId) {
      toast.error('Please select a product')
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
      } catch {
        toast.error('Failed to log validation test')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <RiSparkling2Line className="size-4 text-emerald-600" />
            Log Sri Lanka Market Experiment
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Select Product</Label>
            <Select
              value={form.productId}
              onValueChange={(v: string | null) => {
                if (v) update('productId', v)
              }}
            >
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p._id} value={p._id} className="text-xs">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Method</Label>
              <Select
                value={form.testMethod}
                onValueChange={(v: string | null) => {
                  if (v) update('testMethod', v)
                }}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-order Landing Page" className="text-xs">Pre-order Page</SelectItem>
                  <SelectItem value="TikTok / Reels Ad Test" className="text-xs">TikTok / Reels Ad</SelectItem>
                  <SelectItem value="Sample Feedback Survey" className="text-xs">Sample Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Channel</Label>
              <Input
                value={form.marketingChannel}
                onChange={e => update('marketingChannel', e.target.value)}
                placeholder="Meta Ads, TikTok"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono">
            <div className="space-y-1">
              <Label className="text-xs font-semibold font-sans">Spend (LKR)</Label>
              <Input
                type="number"
                value={form.adSpend}
                onChange={e => update('adSpend', e.target.value)}
                placeholder="5000"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold font-sans">Clicks</Label>
              <Input
                type="number"
                value={form.clicks}
                onChange={e => update('clicks', e.target.value)}
                placeholder="150"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold font-sans">Orders</Label>
              <Input
                type="number"
                value={form.orders}
                onChange={e => update('orders', e.target.value)}
                placeholder="12"
                className="h-9 text-xs font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Result Verdict</Label>
            <Select
              value={form.result}
              onValueChange={(v: string | null) => {
                if (v) update('result', v as ValidationResult)
              }}
            >
              <SelectTrigger className="h-9 text-xs font-semibold"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Validated" className="text-xs">Validated ★ (Bulk Order Ready)</SelectItem>
                <SelectItem value="Promising" className="text-xs">Promising (More Testing)</SelectItem>
                <SelectItem value="Interesting" className="text-xs">Interesting</SelectItem>
                <SelectItem value="Failed" className="text-xs">Failed (Drop)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Customer Comments</Label>
            <Textarea
              value={form.customerFeedback}
              onChange={e => update('customerFeedback', e.target.value)}
              placeholder="Price objections, color preferences..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <Button
            className="flex-1 gap-1.5 bg-primary text-primary-foreground font-semibold"
            onClick={handleSave}
            disabled={isPending || !form.productId}
          >
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
            Save Experiment
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
