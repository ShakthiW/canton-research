import { Suspense } from 'react'
import {
  getDashboardStats,
  getPipelineCounts,
  getTopOpportunities,
  getRecentActivity,
} from '@/lib/queries/products'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { PipelineView } from '@/components/dashboard/PipelineView'
import { TopOpportunities } from '@/components/dashboard/TopOpportunities'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { PriorityActions } from '@/components/dashboard/PriorityActions'

export default async function DashboardPage() {
  const [stats, pipeline, topOpportunities, activities] = await Promise.all([
    getDashboardStats(),
    getPipelineCounts(),
    getTopOpportunities(6),
    getRecentActivity(8),
  ])

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* 1. Sourcing Command Center Hero */}
      <DashboardHero />

      {/* 2. Key Intelligence Horizontal Strip */}
      <DashboardStats stats={stats} />

      {/* 3. Primary Grid: 70% Pipeline / 30% Quick Sourcing Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PipelineView counts={pipeline} />
        </div>
        <div>
          <PriorityActions />
        </div>
      </div>

      {/* 4. Secondary Grid: 60% Top Ranked Opportunities / 40% Recent Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <TopOpportunities products={topOpportunities} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}
