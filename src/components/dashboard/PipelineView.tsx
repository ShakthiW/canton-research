'use client'

import Link from 'next/link'
import type { PipelineCounts } from '@/types'
import { RiArrowRightLine } from '@remixicon/react'

interface PipelineViewProps {
  counts: PipelineCounts
}

const PIPELINE_STAGES = [
  { key: 'Researching', label: 'Research', dot: 'bg-slate-400' },
  { key: 'Shortlisted', label: 'Shortlist', dot: 'bg-amber-500' },
  { key: 'Supplier Contacted', label: 'Supplier', dot: 'bg-blue-500' },
  { key: 'Sample Ordered', label: 'Sample', dot: 'bg-indigo-500' },
  { key: 'Testing', label: 'Testing', dot: 'bg-purple-500' },
  { key: 'Validated', label: 'Validated', dot: 'bg-emerald-500' },
  { key: 'Ready to Order', label: 'Ready', dot: 'bg-teal-500' },
]

export function PipelineView({ counts }: PipelineViewProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Lifecycle Stage</span>
          <h2 className="text-sm font-bold tracking-tight text-foreground mt-0.5">
            Opportunity Pipeline
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {total} Active Opportunities
        </span>
      </div>

      {/* Visual horizontal progression */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = counts[stage.key as keyof PipelineCounts] || 0
          return (
            <Link
              key={stage.key}
              href={`/products?status=${encodeURIComponent(stage.key)}`}
              className="group flex flex-col justify-between p-2.5 rounded border border-border/70 bg-background/60 hover:bg-muted/50 hover:border-border transition-all"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-medium text-muted-foreground truncate group-hover:text-foreground">
                  {stage.label}
                </span>
                <span className={`size-1.5 rounded-full shrink-0 ${stage.dot}`} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black tabular-nums tracking-tight text-foreground">
                  {count}
                </span>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <RiArrowRightLine className="size-3 text-muted-foreground/30 hidden sm:block" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
