'use client'

import { cn } from '@/lib/utils'
import { getScoreCategory } from '@/lib/utils/scoring'

interface OpportunityScoreProps {
  score: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function OpportunityScore({
  score,
  size = 'md',
  showLabel = true,
  className,
}: OpportunityScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score || 0)))
  const category = getScoreCategory(clampedScore)

  // Color mappings
  const getBadgeColors = () => {
    if (clampedScore >= 90) {
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        ring: '#10b981',
      }
    }
    if (clampedScore >= 80) {
      return {
        text: 'text-teal-700 dark:text-teal-400',
        bg: 'bg-teal-50 dark:bg-teal-950/40',
        border: 'border-teal-200 dark:border-teal-800/60',
        ring: '#14b8a6',
      }
    }
    if (clampedScore >= 70) {
      return {
        text: 'text-blue-700 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-800/60',
        ring: '#3b82f6',
      }
    }
    if (clampedScore >= 60) {
      return {
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/60',
        ring: '#f59e0b',
      }
    }
    return {
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900/40',
      border: 'border-slate-200 dark:border-slate-800',
      ring: '#94a3b8',
    }
  }

  const colors = getBadgeColors()

  if (size === 'xs') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums',
          colors.bg,
          colors.text,
          colors.border,
          className
        )}
      >
        <span>{clampedScore}</span>
        {showLabel && <span className="font-normal opacity-80 uppercase tracking-tight text-[9px]">{category}</span>}
      </span>
    )
  }

  if (size === 'sm') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className={cn(
            'inline-flex items-center justify-center font-bold tabular-nums text-xs px-1.5 py-0.5 rounded border min-w-[28px]',
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          {clampedScore}
        </span>
        {showLabel && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {category}
          </span>
        )}
      </div>
    )
  }

  if (size === 'lg') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-3 rounded-lg border text-center min-w-[100px]',
          colors.bg,
          colors.border,
          className
        )}
      >
        <span className={cn('text-3xl font-black tabular-nums tracking-tight', colors.text)}>
          {clampedScore}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
          {category}
        </span>
      </div>
    )
  }

  // Default 'md'
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded border',
        colors.bg,
        colors.border,
        className
      )}
    >
      <span className={cn('text-sm font-bold tabular-nums', colors.text)}>
        {clampedScore}
      </span>
      {showLabel && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {category}
        </span>
      )}
    </div>
  )
}
