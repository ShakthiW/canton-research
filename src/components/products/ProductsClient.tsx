'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { ProductListItem, ProductStatus } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OpportunityScore } from './OpportunityScore'
import { StatusBadge } from './StatusBadge'
import {
  RiSearchLine,
  RiGridLine,
  RiListCheck2,
  RiAddLine,
  RiBuildingLine,
  RiFireLine,
} from '@remixicon/react'
import { cn } from '@/lib/utils'
import { QuickCaptureDialog } from './QuickCaptureDialog'

const STATUS_FILTERS = [
  'All',
  'Researching',
  'Shortlisted',
  'Supplier Contacted',
  'Sample Ordered',
  'Sample Received',
  'Testing',
  'Validated',
  'Ready to Order',
  'Ordered',
  'Rejected',
]

const CATEGORY_FILTERS = [
  'All',
  'Electronics',
  'Home',
  'Kitchen',
  'Beauty',
  'Automotive',
  'Travel',
  'Fitness',
  'Pets',
  'Office',
  'Lifestyle',
  'Gifts',
]

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Recently Updated' },
  { value: 'score', label: 'Score ↓' },
  { value: 'margin', label: 'Margin ↓' },
  { value: 'moq', label: 'MOQ ↑' },
  { value: 'createdAt', label: 'Date Added' },
]

type Density = 'comfortable' | 'compact' | 'dense'

interface ProductsClientProps {
  initialProducts: ProductListItem[]
  total: number
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [quickCapture, setQuickCapture] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [density, setDensity] = useState<Density>('compact')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('score')

  // Load density preference
  useEffect(() => {
    const saved = localStorage.getItem('cpi_table_density') as Density | null
    if (saved && ['comfortable', 'compact', 'dense'].includes(saved)) {
      const timer = setTimeout(() => setDensity(saved), 0)
      return () => clearTimeout(timer)
    }
  }, [])


  function handleDensityChange(newDensity: Density) {
    setDensity(newDensity)
    localStorage.setItem('cpi_table_density', newDensity)
  }

  const filtered = useMemo(() => {
    let items = [...initialProducts]

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sourcePlatform?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (statusFilter !== 'All') {
      items = items.filter(p => p.status === statusFilter)
    }

    if (categoryFilter !== 'All') {
      items = items.filter(p => p.category === categoryFilter)
    }

    if (sortBy === 'score') {
      items.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === 'margin') {
      items.sort((a, b) => {
        const marginA =
          a.sellingPrice > 0 && a.landedCost > 0
            ? (a.sellingPrice - a.landedCost) / a.sellingPrice
            : 0
        const marginB =
          b.sellingPrice > 0 && b.landedCost > 0
            ? (b.sellingPrice - b.landedCost) / b.sellingPrice
            : 0
        return marginB - marginA
      })
    } else if (sortBy === 'moq') {
      items.sort((a, b) => (a.moq || 0) - (b.moq || 0))
    }

    return items
  }, [initialProducts, search, statusFilter, categoryFilter, sortBy])

  return (
    <div className="flex flex-col h-full space-y-4 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Product Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {filtered.length} opportunity signals across your sourcing pipeline
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          onClick={() => setQuickCapture(true)}
        >
          <RiAddLine className="size-4" />
          <span>Capture Product</span>
        </Button>
      </div>

      {/* 2. Compact One-Line Toolbar */}
      <div className="flex items-center gap-2 flex-wrap bg-card p-2 rounded-lg border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product, category, tags, supplier..."
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v: string | null) => {
            if (v) setStatusFilter(v)
          }}
        >
          <SelectTrigger className="h-8 text-xs w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map(s => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(v: string | null) => {
            if (v) setCategoryFilter(v)
          }}
        >
          <SelectTrigger className="h-8 text-xs w-[120px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map(c => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select
          value={sortBy}
          onValueChange={(v: string | null) => {
            if (v) setSortBy(v)
          }}
        >
          <SelectTrigger className="h-8 text-xs w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Density Toggle (when in table mode) */}
        {viewMode === 'table' && (
          <div className="hidden lg:flex items-center border border-border rounded p-0.5 bg-background">
            {(['comfortable', 'compact', 'dense'] as Density[]).map(d => (
              <button
                key={d}
                onClick={() => handleDensityChange(d)}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors',
                  density === d
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {d[0].toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Table / Grid Toggle */}
        <div className="flex items-center border border-border rounded p-0.5 bg-background">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-1 rounded transition-colors',
              viewMode === 'table'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Table View"
          >
            <RiListCheck2 className="size-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Grid View"
          >
            <RiGridLine className="size-4" />
          </button>
        </div>
      </div>

      {/* 3. Content View */}
      <div className="flex-1">
        {viewMode === 'table' ? (
          <ProductTable
            products={filtered}
            density={density}
          />
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>

      <QuickCaptureDialog open={quickCapture} onOpenChange={setQuickCapture} />
    </div>
  )
}

// ─── Research Terminal Table ──────────────────────────────────────────────────

function ProductTable({
  products,
  density,
}: {
  products: ProductListItem[]
  density: Density
}) {
  const paddingClass =
    density === 'dense'
      ? 'py-1.5 px-2.5 text-xs'
      : density === 'compact'
      ? 'py-2.5 px-3 text-xs'
      : 'py-3.5 px-4 text-sm'

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">China Cost</th>
              <th className="py-2.5 px-3 text-right">Landed</th>
              <th className="py-2.5 px-3 text-right">Target Sell</th>
              <th className="py-2.5 px-3 text-right">Margin</th>
              <th className="py-2.5 px-3 text-right">MOQ</th>
              <th className="py-2.5 px-3 text-center">Score</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16">
                  <span className="eyebrow block">Nothing here yet</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    No products match your active search filters.
                  </p>
                </td>
              </tr>
            ) : (
              products.map(p => {
                const margin =
                  p.sellingPrice > 0 && p.landedCost > 0
                    ? (
                        ((p.sellingPrice - p.landedCost) / p.sellingPrice) *
                        100
                      ).toFixed(0)
                    : null

                return (
                  <tr
                    key={p._id}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    {/* Product Name & Thumbnail */}
                    <td className={paddingClass}>
                      <Link
                        href={`/products/${p._id}`}
                        className="flex items-center gap-2.5"
                      >
                        <div className="size-8 rounded bg-muted/80 shrink-0 overflow-hidden border border-border/60 flex items-center justify-center">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={e => {
                                ;(e.target as HTMLImageElement).style.display =
                                  'none'
                              }}
                            />
                          ) : (
                            <span className="text-[9px] font-mono text-muted-foreground">
                              PI
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-[240px] group-hover:text-primary transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-tight">
                            {p.category}
                          </p>
                        </div>
                      </Link>
                    </td>

                    {/* Status */}
                    <td className={paddingClass}>
                      <StatusBadge status={p.status as ProductStatus} />
                    </td>

                    {/* China Cost */}
                    <td className={cn(paddingClass, 'text-right font-mono tabular-nums text-muted-foreground')}>
                      {p.chinaCost ? `$${p.chinaCost.toFixed(2)}` : '—'}
                    </td>

                    {/* Landed Cost */}
                    <td className={cn(paddingClass, 'text-right font-mono tabular-nums text-muted-foreground')}>
                      {p.landedCost ? `$${p.landedCost.toFixed(2)}` : '—'}
                    </td>

                    {/* Sell Price */}
                    <td className={cn(paddingClass, 'text-right font-mono tabular-nums font-semibold')}>
                      {p.sellingPrice ? `$${p.sellingPrice.toFixed(2)}` : '—'}
                    </td>

                    {/* Margin */}
                    <td className={cn(paddingClass, 'text-right font-mono tabular-nums font-bold')}>
                      {margin !== null ? (
                        <span
                          className={cn(
                            parseInt(margin) >= 50
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : parseInt(margin) >= 30
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-500'
                          )}
                        >
                          {margin}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* MOQ */}
                    <td className={cn(paddingClass, 'text-right font-mono tabular-nums text-muted-foreground')}>
                      {p.moq ? p.moq.toLocaleString() : '—'}
                    </td>

                    {/* Score */}
                    <td className={cn(paddingClass, 'text-center')}>
                      <OpportunityScore score={p.score} size="xs" showLabel={false} />
                    </td>

                    {/* Discovery Source */}
                    <td className={paddingClass}>
                      <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                        {p.sourcePlatform || 'Fair'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className={cn(paddingClass, 'text-right')}>
                      <Link
                        href={`/products/${p._id}`}
                        className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Editorial Grid ──────────────────────────────────────────────────────────

function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(p => {
        const margin =
          p.sellingPrice > 0 && p.landedCost > 0
            ? (
                ((p.sellingPrice - p.landedCost) / p.sellingPrice) *
                100
              ).toFixed(0)
            : null

        return (
          <Link
            key={p._id}
            href={`/products/${p._id}`}
            className="group flex flex-col rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all overflow-hidden"
          >
            {/* Image Container with Consistent Aspect Ratio */}
            <div className="relative aspect-4/3 w-full bg-muted/80 overflow-hidden">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <RiBuildingLine className="size-8 text-muted-foreground/30" />
                </div>
              )}

              {/* Score Overlay */}
              <div className="absolute top-2 right-2">
                <OpportunityScore score={p.score} size="xs" />
              </div>

              {p.growthTrend === 'Viral' && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                  <RiFireLine className="size-3" /> Viral
                </div>
              )}
            </div>

            {/* Product Identity */}
            <div className="p-3.5 flex flex-col flex-1 gap-2.5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.category}
                </span>
                <p className="text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {p.name}
                </p>
              </div>

              {/* Economics Row */}
              <div className="grid grid-cols-3 gap-1 bg-muted/40 p-2 rounded text-center">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Cost</p>
                  <p className="text-xs font-mono font-semibold">
                    {p.chinaCost ? `$${p.chinaCost}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Sell</p>
                  <p className="text-xs font-mono font-semibold">
                    {p.sellingPrice ? `$${p.sellingPrice}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Margin</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {margin ? `${margin}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60 text-xs">
                <StatusBadge status={p.status as ProductStatus} size="sm" />
                <span className="text-[11px] font-mono text-muted-foreground">
                  MOQ {p.moq ? p.moq.toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
