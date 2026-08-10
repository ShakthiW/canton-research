'use client'

import Link from 'next/link'
import type { ProductListItem, ProductStatus } from '@/types'
import { OpportunityScore } from '@/components/products/OpportunityScore'
import { StatusBadge } from '@/components/products/StatusBadge'
import { RiArrowRightLine, RiSparklingLine } from '@remixicon/react'

interface TopOpportunitiesProps {
  products: ProductListItem[]
}

export function TopOpportunities({ products }: TopOpportunitiesProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <span className="eyebrow">Ranked Signals</span>
          <h2 className="text-sm font-bold tracking-tight text-foreground mt-0.5 flex items-center gap-1.5">
            <RiSparklingLine className="size-4 text-primary" />
            Top Opportunities
          </h2>
        </div>
        <Link
          href="/products?sort=score"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          View all <RiArrowRightLine className="size-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {products.map((product, i) => {
          const marginPct =
            product.sellingPrice > 0 && product.landedCost > 0
              ? (
                  ((product.sellingPrice - product.landedCost) /
                    product.sellingPrice) *
                  100
                ).toFixed(0)
              : null

          return (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="group flex items-center gap-3.5 p-3 hover:bg-muted/40 transition-colors cockpit-row"
            >
              {/* Rank */}
              <span className="font-mono text-xs font-bold text-muted-foreground/60 w-5 shrink-0 text-center">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Product Thumbnail */}
              <div className="size-10 rounded bg-muted/80 shrink-0 overflow-hidden border border-border/60 flex items-center justify-center">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    PI
                  </span>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-tight">
                    {product.category}
                  </span>
                  <span className="text-muted-foreground/30 text-xs">·</span>
                  <StatusBadge
                    status={product.status as ProductStatus}
                    size="sm"
                  />
                </div>
              </div>

              {/* Economics */}
              <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                {marginPct !== null && (
                  <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {marginPct}% margin
                  </span>
                )}
                <span className="text-[11px] font-mono text-muted-foreground">
                  MOQ {product.moq ? product.moq.toLocaleString() : '—'}
                </span>
              </div>

              {/* Score */}
              <div className="shrink-0">
                <OpportunityScore score={product.score} size="xs" />
              </div>
            </Link>
          )
        })}

        {products.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No products evaluated yet. Add products to rank opportunities.
          </div>
        )}
      </div>
    </div>
  )
}
