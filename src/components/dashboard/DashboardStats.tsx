import type { DashboardStats as Stats } from '@/types'

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const metrics = [
    { label: 'Products', value: stats.totalProducts.toLocaleString(), sub: 'Tracked' },
    { label: 'Shortlisted', value: stats.shortlisted.toLocaleString(), sub: 'High conviction', highlight: 'text-amber-600 dark:text-amber-400' },
    { label: 'Avg Score', value: `${stats.avgScore}`, sub: 'Out of 100', highlight: 'text-primary' },
    { label: 'Best Margin', value: `${stats.bestMargin}%`, sub: 'Gross potential', highlight: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Suppliers', value: stats.totalSuppliers.toLocaleString(), sub: 'Factories' },
    { label: 'Samples', value: stats.samplesOrdered.toLocaleString(), sub: 'In pipeline' },
    { label: 'Validated', value: stats.validated.toLocaleString(), sub: 'Market proven', highlight: 'text-teal-600 dark:text-teal-400' },
  ]

  return (
    <div className="rounded-lg border border-border bg-card/60 divide-y sm:divide-y-0 sm:divide-x divide-border grid grid-cols-2 sm:grid-cols-7 overflow-hidden">
      {metrics.map(m => (
        <div key={m.label} className="p-3.5 flex flex-col justify-between">
          <p className="eyebrow">{m.label}</p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black tabular-nums tracking-tight ${m.highlight || 'text-foreground'}`}>
              {m.value}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{m.sub}</p>
        </div>
      ))}
    </div>
  )
}
