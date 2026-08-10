import type { Activity } from '@/types'
import {
  RiBox3Line,
  RiUserLine,
  RiFlaskLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiSearchEyeLine,
  RiStarLine,
  RiPriceTag3Line,
} from '@remixicon/react'
import { formatDistanceToNow } from '@/lib/utils/time'

const ACTIVITY_ICONS: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  product_created: { icon: RiBox3Line, color: 'text-blue-500' },
  product_updated: { icon: RiBox3Line, color: 'text-slate-400' },
  product_status_changed: { icon: RiArrowRightLine, color: 'text-violet-500' },
  product_shortlisted: { icon: RiStarLine, color: 'text-amber-500' },
  supplier_added: { icon: RiUserLine, color: 'text-indigo-500' },
  supplier_linked: { icon: RiUserLine, color: 'text-indigo-400' },
  price_changed: { icon: RiPriceTag3Line, color: 'text-emerald-500' },
  sample_ordered: { icon: RiFlaskLine, color: 'text-purple-500' },
  sample_received: { icon: RiFlaskLine, color: 'text-teal-500' },
  validation_completed: { icon: RiCheckboxCircleLine, color: 'text-emerald-500' },
  fair_visit_added: { icon: RiSearchEyeLine, color: 'text-rose-500' },
  research_converted: { icon: RiSearchEyeLine, color: 'text-cyan-500' },
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <span className="eyebrow">Audit Trail</span>
        <h2 className="text-sm font-bold tracking-tight text-foreground mt-0.5">
          Recent Intelligence
        </h2>
      </div>

      <div className="divide-y divide-border">
        {activities.map(activity => {
          const config = ACTIVITY_ICONS[activity.type] || {
            icon: RiBox3Line,
            color: 'text-muted-foreground',
          }
          const Icon = config.icon

          return (
            <div
              key={activity._id}
              className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors cockpit-row text-xs"
            >
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-muted/70">
                <Icon className={`size-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {activity.entityName}
                </p>
                <p className="text-muted-foreground text-[11px] truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap shrink-0">
                {formatDistanceToNow(activity.createdAt)}
              </span>
            </div>
          )
        })}

        {activities.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No recent activity recorded.
          </div>
        )}
      </div>
    </div>
  )
}
