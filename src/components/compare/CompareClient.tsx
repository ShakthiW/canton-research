'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ProductListItem, ProductStatus } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OpportunityScore } from '@/components/products/OpportunityScore'
import { StatusBadge } from '@/components/products/StatusBadge'
import { RiScales2Line, RiCloseLine } from '@remixicon/react'

interface CompareClientProps {
  products: ProductListItem[]
}

export function CompareClient({ products }: CompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return products.slice(0, 3).map(p => p._id)
  })

  const selectedProducts = useMemo(() => {
    return selectedIds
      .map(id => products.find(p => p._id === id))
      .filter((p): p is ProductListItem => Boolean(p))
  }, [products, selectedIds])

  function addProduct(id: string) {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id])
    }
  }

  function removeProduct(id: string) {
    setSelectedIds(prev => prev.filter(i => i !== id))
  }

  const availableProducts = products.filter(p => !selectedIds.includes(p._id))

  // Compute best badges
  const bestScoreId = selectedProducts.reduce((best, p) => (!best || p.score > best.score ? p : best), null as ProductListItem | null)?._id
  const bestMarginId = selectedProducts.reduce((best, p) => {
    const margin = p.sellingPrice > 0 && p.landedCost > 0 ? (p.sellingPrice - p.landedCost) / p.sellingPrice : 0
    const bestMargin = best && best.sellingPrice > 0 ? (best.sellingPrice - best.landedCost) / best.sellingPrice : 0
    return margin > bestMargin ? p : best
  }, null as ProductListItem | null)?._id
  const lowestLandedId = selectedProducts.reduce((best, p) => (!best || (p.landedCost > 0 && p.landedCost < best.landedCost) ? p : best), null as ProductListItem | null)?._id

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Analyst Decision Matrix</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiScales2Line className="size-6 text-primary" />
            Compare Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Side-by-side unit economics, sourcing parameters, and risk signals for up to 4 shortlisted items
          </p>
        </div>

        {selectedIds.length < 4 && availableProducts.length > 0 && (
          <div className="w-full sm:w-64">
            <Select onValueChange={(v: string | null) => { if (typeof v === 'string') addProduct(v) }}>
              <SelectTrigger className="h-9 text-xs bg-card">
                <SelectValue placeholder="+ Add product to matrix" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map(p => (
                  <SelectItem key={p._id} value={p._id} className="text-xs">
                    {p.name} ({p.score} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 2. Matrix Table */}
      {selectedProducts.length === 0 ? (
        <div className="p-16 text-center border rounded-lg bg-card">
          <RiScales2Line className="size-10 mx-auto text-muted-foreground/30 mb-2" />
          <span className="eyebrow block">No products selected</span>
          <p className="text-xs text-muted-foreground mt-1">Select at least 2 products above to compare.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] grid" style={{ gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)` }}>
              {/* Product Header Row */}
              <div className="p-3.5 eyebrow flex items-end">
                Product
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3.5 relative border-l border-border bg-muted/20 space-y-2">
                  <button
                    onClick={() => removeProduct(p._id)}
                    className="absolute top-2.5 right-2.5 size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Remove"
                  >
                    <RiCloseLine className="size-3.5" />
                  </button>

                  <div className="h-20 w-full rounded bg-muted overflow-hidden flex items-center justify-center border border-border/60">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">PI</span>
                    )}
                  </div>

                  <Link href={`/products/${p._id}`} className="font-bold text-xs hover:text-primary transition-colors block line-clamp-2">
                    {p.name}
                  </Link>

                  <StatusBadge status={p.status as ProductStatus} size="sm" />
                </div>
              ))}

              {/* Row: Score */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Opportunity Score
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 border-t border-l border-border flex items-center justify-between">
                  <OpportunityScore score={p.score} size="xs" />
                  {p._id === bestScoreId && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Highest
                    </span>
                  )}
                </div>
              ))}

              {/* Row: China Cost */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                China Factory Price
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs font-mono font-bold border-t border-l border-border">
                  {p.chinaCost ? `$${p.chinaCost.toFixed(2)}` : '—'}
                </div>
              ))}

              {/* Row: Landed Cost */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Est. Landed Cost
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs font-mono font-bold text-primary border-t border-l border-border flex items-center justify-between">
                  <span>{p.landedCost ? `$${p.landedCost.toFixed(2)}` : '—'}</span>
                  {p._id === lowestLandedId && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Lowest
                    </span>
                  )}
                </div>
              ))}

              {/* Row: Target Sell */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Target Selling Price
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs font-mono font-semibold border-t border-l border-border">
                  {p.sellingPrice ? `$${p.sellingPrice.toFixed(2)}` : '—'}
                </div>
              ))}

              {/* Row: Gross Margin */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Gross Margin %
              </div>
              {selectedProducts.map(p => {
                const margin = p.sellingPrice > 0 && p.landedCost > 0
                  ? ((p.sellingPrice - p.landedCost) / p.sellingPrice * 100).toFixed(0)
                  : null
                return (
                  <div key={p._id} className="p-3 text-xs font-mono font-bold border-t border-l border-border flex items-center justify-between">
                    <span className={margin && parseInt(margin) >= 50 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      {margin ? `${margin}%` : '—'}
                    </span>
                    {p._id === bestMarginId && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Top Margin
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Row: MOQ */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                MOQ
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs font-mono border-t border-l border-border">
                  {p.moq ? p.moq.toLocaleString() : '—'}
                </div>
              ))}

              {/* Row: Competition */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Local Competition
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs border-t border-l border-border">
                  {p.competitionLevel || 'Low'}
                </div>
              ))}

              {/* Row: Trend */}
              <div className="p-3 text-xs font-semibold text-muted-foreground border-t border-border flex items-center">
                Growth Trend
              </div>
              {selectedProducts.map(p => (
                <div key={p._id} className="p-3 text-xs border-t border-l border-border">
                  {p.growthTrend || 'Growing'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
