'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { addLocalCompetitorAction } from '@/lib/actions/desk-research'
import { toast } from 'sonner'
import {
  RiCloseLine,
  RiLoader4Line,
  RiStore2Line,
  RiShoppingBag2Line,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiGlobalLine,
  RiStoreLine,
  RiLinkM,
} from '@remixicon/react'
import type { LocalCompetitorListing } from '@/types'

const LOCAL_PLATFORMS: Array<{
  id: 'Daraz' | 'Instagram Shop' | 'Facebook Page' | 'Direct Website' | 'Retail Shop'
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeColor: string
}> = [
  { id: 'Daraz', label: 'Daraz.lk', icon: RiShoppingBag2Line, activeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/40 dark:text-orange-400 ring-2 ring-orange-500/20' },
  { id: 'Instagram Shop', label: 'Instagram', icon: RiInstagramLine, activeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/40 dark:text-pink-400 ring-2 ring-pink-500/20' },
  { id: 'Facebook Page', label: 'Facebook', icon: RiFacebookCircleLine, activeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:text-blue-400 ring-2 ring-blue-500/20' },
  { id: 'Direct Website', label: 'Website', icon: RiGlobalLine, activeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40 dark:text-emerald-400 ring-2 ring-emerald-500/20' },
  { id: 'Retail Shop', label: 'Retail Shop', icon: RiStoreLine, activeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/40 dark:text-amber-400 ring-2 ring-amber-500/20' },
]

interface AddLocalCompetitorModalProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newCompetitor: LocalCompetitorListing) => void
}

export function AddLocalCompetitorModal({ productId, isOpen, onClose, onSuccess }: AddLocalCompetitorModalProps) {
  const [isPending, startTransition] = useTransition()
  const [platform, setPlatform] = useState<'Daraz' | 'Instagram Shop' | 'Facebook Page' | 'Direct Website' | 'Retail Shop'>('Daraz')
  const [storeName, setStoreName] = useState('')
  const [sellingPriceLkr, setSellingPriceLkr] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [observations, setObservations] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeName.trim()) {
      toast.error('Please enter store / seller name')
      return
    }
    const priceNum = parseFloat(sellingPriceLkr)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price in LKR')
      return
    }

    startTransition(async () => {
      try {
        const res = await addLocalCompetitorAction(productId, {
          platform,
          storeName: storeName.trim(),
          sellingPriceLkr: priceNum,
          productUrl: productUrl.trim() || undefined,
          observations: observations.trim() || undefined,
        })
        toast.success('Local seller listing added!')
        if (res.newCompetitor) {
          onSuccess?.(res.newCompetitor)
        }
        onClose()
        setStoreName('')
        setSellingPriceLkr('')
        setProductUrl('')
        setObservations('')
      } catch {
        toast.error('Failed to add local seller listing')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <RiStore2Line className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">Add Sri Lanka Local Seller Listing</h3>
              <p className="text-[11px] text-muted-foreground">Benchmark Sri Lankan retail pricing and stock availability</p>
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
          {/* Local Channel Selector Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Local Channel *
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {LOCAL_PLATFORMS.map(p => {
                const Icon = p.icon
                const isSelected = platform === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? p.activeColor
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-[11px] font-bold mt-1 leading-tight">{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Store / Seller Name */}
          <div className="space-y-1.5">
            <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Store / Seller Name *
            </Label>
            <div className="relative">
              <RiStore2Line className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="storeName"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. TrendyGadgets.lk, TechStore Colombo"
                className="pl-9 h-10 text-xs font-medium rounded-xl"
                required
              />
            </div>
          </div>

          {/* Local Selling Price LKR */}
          <div className="space-y-1.5">
            <Label htmlFor="lkr" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Local Selling Price (LKR Rs.) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground">Rs.</span>
              <Input
                id="lkr"
                type="number"
                value={sellingPriceLkr}
                onChange={e => setSellingPriceLkr(e.target.value)}
                placeholder="4500"
                className="pl-10 h-10 text-xs font-mono font-bold rounded-xl"
                required
              />
            </div>
          </div>

          {/* Store Listing URL */}
          <div className="space-y-1.5">
            <Label htmlFor="prodUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Store Listing URL
            </Label>
            <div className="relative">
              <RiLinkM className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="prodUrl"
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
                placeholder="https://www.daraz.lk/products/..."
                className="pl-9 h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <Label htmlFor="obs" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Observations / Stock Status Notes
            </Label>
            <Input
              id="obs"
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="e.g. Out of stock, high reviews, selling replica..."
              className="h-10 text-xs rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/80">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs font-bold rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 h-10 text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
              {isPending && <RiLoader4Line className="size-4 animate-spin" />}
              <span>Add Local Seller</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
