'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { addOverseasProviderAction } from '@/lib/actions/desk-research'
import { toast } from 'sonner'
import {
  RiCloseLine,
  RiLoader4Line,
  RiBuildingLine,
  RiShoppingBagLine,
  RiGlobalLine,
  RiStoreLine,
  RiLinkM,
  RiStarFill,
  RiMoneyDollarCircleLine,
  RiStackLine,
} from '@remixicon/react'
import type { OverseasProviderOffer } from '@/types'

const OVERSEAS_PLATFORMS: Array<{
  id: '1688' | 'Alibaba' | 'Taobao' | 'Made-in-China' | 'Other'
  label: string
  sub: string
  icon: React.ComponentType<{ className?: string }>
  activeColor: string
}> = [
  { id: '1688', label: '1688', sub: 'China Wholesale', icon: RiShoppingBagLine, activeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/40 dark:text-orange-400 ring-2 ring-orange-500/20' },
  { id: 'Alibaba', label: 'Alibaba', sub: 'Global B2B', icon: RiGlobalLine, activeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/40 dark:text-amber-400 ring-2 ring-amber-500/20' },
  { id: 'Taobao', label: 'Taobao', sub: 'Domestic Retail', icon: RiStoreLine, activeColor: 'bg-red-500/10 text-red-600 border-red-500/40 dark:text-red-400 ring-2 ring-red-500/20' },
  { id: 'Made-in-China', label: 'Made in China', sub: 'B2B Portal', icon: RiBuildingLine, activeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/40 dark:text-blue-400 ring-2 ring-blue-500/20' },
  { id: 'Other', label: 'Direct Factory', sub: 'Direct OEM', icon: RiBuildingLine, activeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/40 dark:text-indigo-400 ring-2 ring-indigo-500/20' },
]

interface AddProviderModalProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newProvider: OverseasProviderOffer) => void
}

export function AddProviderModal({ productId, isOpen, onClose, onSuccess }: AddProviderModalProps) {
  const [isPending, startTransition] = useTransition()
  const [platform, setPlatform] = useState<'1688' | 'Alibaba' | 'Taobao' | 'Made-in-China' | 'Other'>('1688')
  const [storeName, setStoreName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [fobPriceUsd, setFobPriceUsd] = useState('')
  const [moq, setMoq] = useState('100')
  const [isPreferred, setIsPreferred] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!storeName.trim()) {
      toast.error('Please enter supplier or store name')
      return
    }
    const priceNum = parseFloat(fobPriceUsd)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid FOB price in USD')
      return
    }

    startTransition(async () => {
      try {
        const res = await addOverseasProviderAction(productId, {
          platform,
          storeName: storeName.trim(),
          storeUrl: storeUrl.trim() || undefined,
          fobPriceUsd: priceNum,
          moq: parseInt(moq) || 100,
          isPreferred,
        })
        toast.success('Supplier offer added!')
        if (res.newProvider) {
          onSuccess?.(res.newProvider)
        }
        onClose()
        setStoreName('')
        setStoreUrl('')
        setFobPriceUsd('')
      } catch {
        toast.error('Failed to add supplier offer')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <RiBuildingLine className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">Add Overseas Supplier Offer</h3>
              <p className="text-[11px] text-muted-foreground">Log factory quote, FOB cost ($ USD), and MOQ</p>
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
          {/* Platform Selector Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Supplier Platform *
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {OVERSEAS_PLATFORMS.map(p => {
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

          {/* Supplier / Store Name */}
          <div className="space-y-1.5">
            <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Supplier / Store Name *
            </Label>
            <div className="relative">
              <RiBuildingLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="storeName"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. Yiwu Jinghang Electronics Co., Ltd."
                className="pl-9 h-10 text-xs font-medium rounded-xl"
                required
              />
            </div>
          </div>

          {/* Pricing & MOQ Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fob" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                FOB Price ($ USD) *
              </Label>
              <div className="relative">
                <RiMoneyDollarCircleLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="fob"
                  type="number"
                  step="0.01"
                  value={fobPriceUsd}
                  onChange={e => setFobPriceUsd(e.target.value)}
                  placeholder="2.50"
                  className="pl-9 h-10 text-xs font-mono font-bold rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="moq" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                MOQ (Units)
              </Label>
              <div className="relative">
                <RiStackLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="moq"
                  type="number"
                  value={moq}
                  onChange={e => setMoq(e.target.value)}
                  placeholder="100"
                  className="pl-9 h-10 text-xs font-mono rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Store URL */}
          <div className="space-y-1.5">
            <Label htmlFor="storeUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Direct Listing / Store Web Link
            </Label>
            <div className="relative">
              <RiLinkM className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="storeUrl"
                value={storeUrl}
                onChange={e => setStoreUrl(e.target.value)}
                placeholder="https://detail.1688.com/offer/..."
                className="pl-9 h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Preferred Choice Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsPreferred(!isPreferred)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold w-full transition-all ${
              isPreferred
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 ring-2 ring-amber-500/20'
                : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <RiStarFill className={`size-4 ${isPreferred ? 'text-amber-500' : 'text-muted-foreground/50'}`} />
            <div className="text-left flex-1">
              <span className="font-bold block text-foreground">Set as Preferred Supplier Choice</span>
              <span className="text-[10px] text-muted-foreground">Use this supplier FOB price for landed cost calculations</span>
            </div>
          </button>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/80">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs font-bold rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 h-10 text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              {isPending && <RiLoader4Line className="size-4 animate-spin" />}
              <span>Add Supplier</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
