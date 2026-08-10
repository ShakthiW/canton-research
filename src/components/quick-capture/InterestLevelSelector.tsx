'use client'

import type { BoothInterestLevel } from '@/types'
import { cn } from '@/lib/utils'
import { RiFireLine, RiStarLine, RiTimeLine, RiCloseCircleLine } from '@remixicon/react'

interface Option {
  id: BoothInterestLevel
  label: string
  subtitle: string
  icon: typeof RiFireLine
  activeClass: string
  badgeBg: string
}

const INTEREST_OPTIONS: Option[] = [
  {
    id: 'Shortlisted',
    label: 'High Interest',
    subtitle: 'Must buy / High priority',
    icon: RiFireLine,
    activeClass: 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600 ring-2 ring-emerald-500/30',
    badgeBg: 'bg-emerald-500 text-white',
  },
  {
    id: 'Interesting',
    label: 'Interesting',
    subtitle: 'Promising candidate',
    icon: RiStarLine,
    activeClass: 'border-amber-500 bg-amber-50/80 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600 ring-2 ring-amber-500/30',
    badgeBg: 'bg-amber-500 text-white',
  },
  {
    id: 'Follow Up',
    label: 'Follow Up',
    subtitle: 'Need more info / quotes',
    icon: RiTimeLine,
    activeClass: 'border-blue-500 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-600 ring-2 ring-blue-500/30',
    badgeBg: 'bg-blue-500 text-white',
  },
  {
    id: 'Rejected',
    label: 'Skip / Reject',
    subtitle: 'Not fitting criteria',
    icon: RiCloseCircleLine,
    activeClass: 'border-rose-500 bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-600 ring-2 ring-rose-500/30',
    badgeBg: 'bg-rose-500 text-white',
  },
]

interface InterestLevelSelectorProps {
  value: BoothInterestLevel
  onChange: (level: BoothInterestLevel) => void
}

export function InterestLevelSelector({ value, onChange }: InterestLevelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Interest Level *
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        {INTEREST_OPTIONS.map(opt => {
          const Icon = opt.icon
          const isSelected = value === opt.id

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                'relative flex flex-col p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98]',
                'min-h-[76px] justify-between touch-manipulation select-none',
                isSelected
                  ? opt.activeClass
                  : 'border-border/70 bg-card text-foreground hover:bg-accent/40'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                  isSelected ? opt.badgeBg : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="size-4" />
                </div>
                <div className={cn(
                  'h-4 w-4 rounded-full border flex items-center justify-center',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                )}>
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-xs font-bold leading-tight">{opt.label}</p>
                <p className="text-[10px] opacity-80 truncate">{opt.subtitle}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
