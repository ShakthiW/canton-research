import { cn } from '@/lib/utils'
import type { ProductStatus } from '@/types'

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  Researching: {
    label: 'Researching',
    dot: 'bg-slate-400',
    text: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100/80 dark:bg-slate-900/40',
    border: 'border-slate-200 dark:border-slate-800',
  },
  Shortlisted: {
    label: 'Shortlisted',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40',
    border: 'border-amber-200/80 dark:border-amber-800/50',
  },
  'Supplier Contacted': {
    label: 'Contacted',
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50/80 dark:bg-blue-950/40',
    border: 'border-blue-200/80 dark:border-blue-800/50',
  },
  'Sample Ordered': {
    label: 'Sample Ordered',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
    border: 'border-indigo-200/80 dark:border-indigo-800/50',
  },
  'Sample Received': {
    label: 'Sample In Review',
    dot: 'bg-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50/80 dark:bg-purple-950/40',
    border: 'border-purple-200/80 dark:border-purple-800/50',
  },
  Testing: {
    label: 'Testing Market',
    dot: 'bg-cyan-500',
    text: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-50/80 dark:bg-cyan-950/40',
    border: 'border-cyan-200/80 dark:border-cyan-800/50',
  },
  Validated: {
    label: 'Validated',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    border: 'border-emerald-200/80 dark:border-emerald-800/50',
  },
  'Ready to Order': {
    label: 'Ready to Order',
    dot: 'bg-emerald-600',
    text: 'text-emerald-800 dark:text-emerald-200',
    bg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    border: 'border-emerald-300 dark:border-emerald-700/50',
  },
  Ordered: {
    label: 'Ordered',
    dot: 'bg-teal-600',
    text: 'text-teal-800 dark:text-teal-200',
    bg: 'bg-teal-100/80 dark:bg-teal-900/40',
    border: 'border-teal-300 dark:border-teal-700/50',
  },
  Rejected: {
    label: 'Passed',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50/80 dark:bg-rose-950/40',
    border: 'border-rose-200/80 dark:border-rose-800/50',
  },
  Archived: {
    label: 'Archived',
    dot: 'bg-slate-400',
    text: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-transparent',
    border: 'border-transparent',
  },
}

interface StatusBadgeProps {
  status: ProductStatus
  variant?: 'dot' | 'pill'
  size?: 'sm' | 'default'
  className?: string
}

export function StatusBadge({
  status,
  variant = 'dot',
  size = 'default',
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  }

  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium whitespace-nowrap select-none',
          size === 'sm' ? 'text-[11px]' : 'text-xs',
          config.text,
          className
        )}
      >
        <span className={cn('size-1.5 rounded-full shrink-0', config.dot)} />
        <span>{config.label}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium whitespace-nowrap select-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  )
}

export const ALL_STATUSES: ProductStatus[] = [
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
  'Archived',
]
