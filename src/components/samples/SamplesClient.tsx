'use client'

import Link from 'next/link'
import type { Sample, ProductListItem } from '@/types'
import { formatDate } from '@/lib/utils/time'
import { RiFlaskLine, RiTruckLine, RiCheckboxCircleLine, RiTimeLine } from '@remixicon/react'
import { cn } from '@/lib/utils'

interface SamplesClientProps {
  samples: Sample[]
  total: number
  products: ProductListItem[]
}

export function SamplesClient({ samples, total, products }: SamplesClientProps) {
  const productMap = new Map(products.map(p => [p._id, p]))

  const inTransit = samples.filter(s => ['Ordered', 'Shipped'].includes(s.status))
  const received = samples.filter(s => ['Received', 'Under Review'].includes(s.status))
  const decided = samples.filter(s => s.status === 'Decided')

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Physical Testing Laboratory</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <RiFlaskLine className="size-6 text-purple-600 dark:text-purple-400" />
            Samples & Quality Assurance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track sample dispatches from China, evaluate physical build quality, packaging, and commercial viability
          </p>
        </div>
      </div>

      {/* 2. Pipeline Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">In Transit</span>
          <p className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
            {inTransit.length}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">Under Review</span>
          <p className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
            {received.length}
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card">
          <span className="eyebrow">Decided / Evaluated</span>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {decided.length}
          </p>
        </div>
      </div>

      {/* 3. Sample Cards */}
      <div className="space-y-3">
        <span className="eyebrow block">Sample Evaluation Queue</span>
        {samples.map(sample => {
          const product = productMap.get(sample.productId)

          return (
            <div key={sample._id} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/products/${sample.productId}`}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {product?.name || 'Sample Product'}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ordered: {formatDate(sample.orderDate)} {sample.expectedArrival && `· ETA: ${formatDate(sample.expectedArrival)}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted">
                    Total Sample Cost: ${(sample.sampleCost + sample.shippingCost).toFixed(0)}
                  </span>
                  <span className={cn(
                    'text-xs font-bold uppercase px-2 py-0.5 rounded',
                    sample.finalDecision === 'Approve' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                  )}>
                    {sample.finalDecision}
                  </span>
                </div>
              </div>

              {sample.notes && (
                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded">
                  {sample.notes}
                </p>
              )}

              {/* 4-factor scoring */}
              {sample.status === 'Decided' && (
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border text-center font-mono">
                  <ScoreFactor label="Build Quality" score={sample.qualityScore} />
                  <ScoreFactor label="Packaging" score={sample.packagingScore} />
                  <ScoreFactor label="Customer Appeal" score={sample.customerAppeal} />
                  <ScoreFactor label="Usefulness" score={sample.productUsefulness} />
                </div>
              )}
            </div>
          )
        })}

        {samples.length === 0 && (
          <div className="p-16 text-center border rounded-lg bg-card">
            <span className="eyebrow block">No samples in queue</span>
            <p className="text-xs text-muted-foreground mt-1">
              Order samples from shortlisted products to begin physical quality evaluations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreFactor({ label, score }: { label: string; score: number }) {
  return (
    <div className="p-2 rounded bg-muted/40 border border-border/50">
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <p className="text-sm font-bold text-foreground mt-0.5">{score || '—'} / 10</p>
    </div>
  )
}
