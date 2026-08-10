'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ProductListItem, ProductStatus } from '@/types'
import { OpportunityScore } from '@/components/products/OpportunityScore'
import { StatusBadge } from '@/components/products/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RiStarLine, RiFireLine } from '@remixicon/react'
import { cn } from '@/lib/utils'

interface ShortlistClientProps {
  products: ProductListItem[]
  total: number
}

export function ShortlistClient({ products: initialProducts }: ShortlistClientProps) {
  const [sortBy, setSortBy] = useState('score')

  const products = useMemo(() => {
    const items = [...initialProducts]
    if (sortBy === 'score') {
      items.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === 'margin') {
      items.sort((a, b) => {
        const marginA = a.sellingPrice > 0 && a.landedCost > 0 ? (a.sellingPrice - a.landedCost) / a.sellingPrice : 0
        const marginB = b.sellingPrice > 0 && b.landedCost > 0 ? (b.sellingPrice - b.landedCost) / b.sellingPrice : 0
        return marginB - marginA
      })
    } else if (sortBy === 'moq') {
      items.sort((a, b) => (a.moq || 0) - (b.moq || 0))
    }
    return items
  }, [initialProducts, sortBy])

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-5">
      {/* 1. Deal Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow text-amber-600 dark:text-amber-400">
            Decision Room
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiStarLine className="size-6 text-amber-500 fill-amber-500" />
            Shortlist
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {products.length} high-conviction product opportunities prioritized for sampling and supplier negotiation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: string | null) => { if (v) setSortBy(v) }}>
            <SelectTrigger className="h-8 text-xs w-[140px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score" className="text-xs">Score ↓</SelectItem>
              <SelectItem value="margin" className="text-xs">Margin ↓</SelectItem>
              <SelectItem value="moq" className="text-xs">MOQ ↑</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Hybrid Deal Room List */}
      {products.length === 0 ? (
        <div className="p-16 text-center border rounded-lg bg-card">
          <RiStarLine className="size-10 mx-auto text-muted-foreground/30 mb-2" />
          <span className="eyebrow block">No Shortlisted Products</span>
          <p className="text-xs text-muted-foreground mt-1">
            Score promising items in the product catalog and advance them to your shortlist.
          </p>
          <Link href="/products" className="text-xs font-semibold text-primary mt-3 inline-block hover:underline">
            Browse Product Signals →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {products.map((product, i) => {
            const margin =
              product.sellingPrice > 0 && product.landedCost > 0
                ? (((product.sellingPrice - product.landedCost) / product.sellingPrice) * 100).toFixed(0)
                : null

            return (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all p-4 cockpit-row"
              >
                {/* Left: Rank, Image & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-mono text-base font-black text-muted-foreground/40 w-6 shrink-0 text-center">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="size-12 rounded bg-muted/80 shrink-0 overflow-hidden border border-border/60 flex items-center justify-center">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">PI</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      {product.growthTrend === 'Viral' && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                          <RiFireLine className="size-2.5" /> Viral
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="uppercase tracking-tight text-[11px]">{product.category}</span>
                      <span>·</span>
                      <StatusBadge status={product.status as ProductStatus} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Right: Key Economics & Score */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <div className="text-left sm:text-right text-xs font-mono">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Factory / Landed
                    </span>
                    <span className="font-semibold text-foreground">
                      ${product.chinaCost ? product.chinaCost.toFixed(2) : '0'} → ${product.landedCost ? product.landedCost.toFixed(2) : '0'}
                    </span>
                  </div>

                  <div className="text-right text-xs font-mono">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Margin / MOQ
                    </span>
                    <span className={cn(
                      'font-bold',
                      margin && parseInt(margin) >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    )}>
                      {margin ? `${margin}%` : '—'} · MOQ {product.moq || '—'}
                    </span>
                  </div>

                  <OpportunityScore score={product.score} size="sm" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
