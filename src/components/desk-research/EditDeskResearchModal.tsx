'use client'

import { useState, useTransition } from 'react'
import type { Product, ProductStatus } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateDeskResearchProductAction } from '@/lib/actions/desk-research'
import { ALL_STATUSES } from '@/components/products/StatusBadge'
import { toast } from 'sonner'
import {
  RiCloseLine,
  RiLoader4Line,
  RiEditLine,
  RiBox3Line,
  RiMoneyDollarCircleLine,
  RiLinkM,
} from '@remixicon/react'

const CATEGORIES = [
  'Electronics', 'Home', 'Kitchen', 'Beauty', 'Fitness',
  'Kids', 'Pet', 'Fashion', 'Auto', 'Outdoor', 'Tools', 'Other',
]

interface EditDeskResearchModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updates: Partial<Product>) => void
}

export function EditDeskResearchModal({ product, isOpen, onClose, onSuccess }: EditDeskResearchModalProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(product.name || '')
  const [category, setCategory] = useState(product.category || 'Other')
  const [chinaCost, setChinaCost] = useState(product.chinaCost?.toString() || '0')
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice?.toString() || '0')
  const [status, setStatus] = useState<ProductStatus>(product.status || 'Researching')
  const [sourceUrl, setSourceUrl] = useState(product.sourceUrl || '')
  const [notes, setNotes] = useState(product.notes || '')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Product name is required')
      return
    }

    const updates: Partial<Product> = {
      name: name.trim(),
      category,
      chinaCost: parseFloat(chinaCost) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      status,
      sourceUrl: sourceUrl.trim(),
      notes: notes.trim(),
      researchHighlights: notes.trim(),
    }

    startTransition(async () => {
      try {
        await updateDeskResearchProductAction(product._id, updates)
        toast.success('Product research updated!')
        onSuccess?.(updates)
        onClose()
      } catch {
        toast.error('Failed to update product details')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <RiEditLine className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">Edit Desk Research Product</h3>
              <p className="text-[11px] text-muted-foreground">Update product name, category, pricing & research highlights</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Name *
            </Label>
            <div className="relative">
              <RiBox3Line className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Wireless Portable Speaker"
                className="pl-9 h-10 text-xs font-bold rounded-xl"
                required
              />
            </div>
          </div>

          {/* Category Pill Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category *
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status Stage Pill Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Status Stage *
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map(st => {
                const isSelected = status === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/40 dark:text-amber-400 ring-2 ring-amber-500/20'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {st}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chinaCost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                FOB China Cost ($ USD)
              </Label>
              <div className="relative">
                <RiMoneyDollarCircleLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="chinaCost"
                  type="number"
                  step="0.01"
                  value={chinaCost}
                  onChange={e => setChinaCost(e.target.value)}
                  placeholder="2.50"
                  className="pl-9 h-10 text-xs font-mono font-bold rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Selling Price (LKR Rs.)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground">Rs.</span>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                  placeholder="4500"
                  className="pl-10 h-10 text-xs font-mono font-bold rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Source Link */}
          <div className="space-y-1.5">
            <Label htmlFor="sourceUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Primary Source URL (TikTok / 1688 Link)
            </Label>
            <div className="relative">
              <RiLinkM className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="sourceUrl"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="pl-9 h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Research Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Founder Research Notes & Key Bullet Points
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add key research notes or points..."
              rows={3}
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/80">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs font-bold rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 h-10 text-xs font-bold gap-1.5 bg-primary text-primary-foreground rounded-xl">
              {isPending && <RiLoader4Line className="size-4 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
