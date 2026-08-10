'use client'

import { ResearchRun } from '@/types/intelligence'
import {
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiSparklingLine,
  RiTimeLine,
  RiTerminalBoxLine,
} from '@remixicon/react'

interface LiveResearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeRun?: ResearchRun | null
}

export function LiveResearchDrawer({ isOpen, onClose, activeRun }: LiveResearchDrawerProps) {
  if (!isOpen) return null

  const modules = [
    { key: 'PRODUCT_ID', label: 'Product Identification & Keywords' },
    { key: 'SUPPLIER_DISCOVERY', label: 'Supplier Candidates & Matching' },
    { key: 'SPECIFICATIONS', label: 'Weight, Dimensions & Carton Packaging' },
    { key: 'IMPORT_CUSTOMS', label: 'Sri Lanka Customs HS & Tariff Taxes' },
    { key: 'DEMAND_RESEARCH', label: 'Sri Lankan Market Search Demand' },
    { key: 'COMPETITION', label: 'Local Seller Density & Price Distribution' },
    { key: 'OPPORTUNITY_SCORE', label: 'Deterministic Opportunity Score' },
  ]

  const getModuleStatus = (key: string) => {
    if (!activeRun) return 'RUNNING'
    const status = activeRun.modules[key]
    return status || 'PENDING'
  }

  const moduleSummaries = activeRun?.moduleSummaries || {}
  const logs = activeRun?.logs || []

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <RiSparklingLine className="h-5 w-5 text-indigo-500 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">
            AI Research Execution
          </h3>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Asynchronous Non-Blocking Research
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gemini specialized agents are executing in parallel. Information progressively populates your screen as each module completes.
          </p>
        </div>

        <div className="space-y-2.5">
          {modules.map((m) => {
            const status = getModuleStatus(m.key)
            const summarySnippet = moduleSummaries[m.key]

            return (
              <div
                key={m.key}
                className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {m.label}
                  </span>

                  {status === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <RiCheckLine className="h-3.5 w-3.5" /> Complete
                    </span>
                  ) : status === 'RUNNING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <RiLoader4Line className="h-3.5 w-3.5 animate-spin" /> Running
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <RiTimeLine className="h-3.5 w-3.5" /> Waiting
                    </span>
                  )}
                </div>

                {summarySnippet && (
                  <p className="text-[11px] font-mono text-muted-foreground bg-muted/60 rounded p-2 border border-border/50">
                    {summarySnippet}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Live Activity Stream Terminal Log */}
        {logs.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <RiTerminalBoxLine className="size-4 text-indigo-500" />
              Live Activity Stream
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[10px]">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                  <span className="text-indigo-500 font-bold shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 mt-2">
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow"
        >
          Keep Working in Background
        </button>
      </div>
    </div>
  )
}
