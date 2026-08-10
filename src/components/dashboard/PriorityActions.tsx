import Link from 'next/link'
import {
  RiFlashlightLine,
  RiScales2Line,
  RiCalculatorLine,
  RiStarLine,
  RiArrowRightLine,
} from '@remixicon/react'

const ACTIONS = [
  {
    label: 'Canton Fair Walking Mode',
    desc: 'Rapid 30-second booth entry with price & MOQ',
    href: '/canton-fair',
    icon: RiFlashlightLine,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Decision Room (Shortlist)',
    desc: 'Review high-conviction product opportunities',
    href: '/shortlist',
    icon: RiStarLine,
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Compare Products Matrix',
    desc: 'Side-by-side evaluation of top 4 products',
    href: '/compare',
    icon: RiScales2Line,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Landed Cost Calculator',
    desc: 'Simulate full shipping, duty & margin economics',
    href: '/calculator',
    icon: RiCalculatorLine,
    color: 'text-purple-600 dark:text-purple-400',
  },
]

export function PriorityActions() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <span className="eyebrow">Quick Tools</span>
        <h2 className="text-sm font-bold tracking-tight text-foreground mt-0.5">
          Sourcing Radar
        </h2>
      </div>

      <div className="space-y-1.5">
        {ACTIONS.map(action => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 p-2 rounded hover:bg-muted/50 transition-colors group"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted/60">
                <Icon className={`size-4 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {action.desc}
                </p>
              </div>
              <RiArrowRightLine className="size-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
