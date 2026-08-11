'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { ProductListItem } from '@/types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RiSearchLine,
  RiBox3Line,
  RiCheckLine,
  RiArrowRightLine,
} from '@remixicon/react'

interface ProductPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: ProductListItem[]
  onSelect: (product: ProductListItem) => void
  selectedProductId?: string
}

const CATEGORIES = [
  'All',
  'Electronics',
  'Home',
  'Kitchen',
  'Beauty',
  'Fitness',
  'Automotive',
  'Other',
]

export function ProductPickerModal({
  open,
  onOpenChange,
  products,
  onSelect,
  selectedProductId,
}: ProductPickerModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filteredProducts = useMemo(() => {
    let items = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (category !== 'All') {
      items = items.filter(p => p.category === category)
    }

    return items
  }, [products, search, category])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-gradient-to-r from-primary/10 via-background to-background flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <RiBox3Line className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Select Product from Catalog</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Browse or search product catalog to link market experiment</p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search + Category Filter Pills */}
        <div className="p-4 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product by name, category, or tags..."
              className="pl-10 h-11 text-xs font-semibold rounded-xl bg-background"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  category === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const isSelected = selectedProductId === product._id
              return (
                <div
                  key={product._id}
                  onClick={() => {
                    onSelect(product)
                    onOpenChange(false)
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                          <RiBox3Line className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {product.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                          {product.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                        <span>Landed: <strong className="text-foreground">${product.landedCost?.toFixed(2) || '0.00'}</strong></span>
                        {product.sellingPrice > 0 && (
                          <span>Target Sell: <strong className="text-emerald-600 dark:text-emerald-400">${product.sellingPrice.toFixed(2)}</strong></span>
                        )}
                        <span>Score: <strong className="text-primary font-bold">{product.score || 0}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-3">
                    {isSelected ? (
                      <Button size="sm" className="h-9 px-3 text-xs font-bold gap-1 rounded-xl bg-primary text-primary-foreground">
                        <RiCheckLine className="size-4" />
                        <span>Selected</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 text-xs font-bold gap-1 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                      >
                        <span>Select</span>
                        <RiArrowRightLine className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center bg-card border border-dashed border-border rounded-xl space-y-2">
              <RiBox3Line className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-bold text-foreground">No matching products found</p>
              <p className="text-[11px] text-muted-foreground">Try adjusting your search query or category filter.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
