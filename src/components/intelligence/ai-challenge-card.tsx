'use client'

import { VerificationCheckitem } from '@/types/intelligence'
import { RiAlertLine, RiCheckboxCircleLine, RiErrorWarningLine, RiShieldCrossLine, RiSparklingLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'

interface AIChallengeCardProps {
  counterArguments?: string[]
  hiddenCosts?: string[]
  failureModes?: string[]
  verificationChecklist?: VerificationCheckitem[]
  hasBeenAnalyzed?: boolean
  isAnalyzing?: boolean
  onTriggerResearch?: () => void
  onToggleCheckitem?: (id: string) => void
}

export function AIChallengeCard({
  counterArguments = [],
  hiddenCosts = [],
  verificationChecklist = [],
  hasBeenAnalyzed = false,
  isAnalyzing,
  onTriggerResearch,
  onToggleCheckitem,
}: AIChallengeCardProps) {
  const hasData = hasBeenAnalyzed && (counterArguments.length > 0 || hiddenCosts.length > 0 || verificationChecklist.length > 0)

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/10 space-y-4">
      <div className="flex items-center gap-2 border-b border-rose-200/50 pb-4 dark:border-rose-900/30">
        <RiShieldCrossLine className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">
          Red-Team AI Challenge (Product Failure Analysis)
        </h3>
      </div>

      {!hasData ? (
        <div className="p-6 text-center border border-dashed border-rose-300 dark:border-rose-800 rounded-xl space-y-3 bg-white/50 dark:bg-slate-900/50">
          <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <RiShieldCrossLine className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Red-Team AI Challenge Pending
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Run AI Analysis to trigger stress-testing failure mode analysis, hidden cost extraction, and pre-order verification checklist generation.
            </p>
          </div>
          {onTriggerResearch && (
            <Button
              size="sm"
              onClick={onTriggerResearch}
              disabled={isAnalyzing}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow gap-1.5"
            >
              <RiSparklingLine className={`size-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Risks...' : '✨ Run Red-Team AI Analysis'}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Counter Arguments & Hidden Costs */}
          <div className="space-y-5">
            {counterArguments.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  <RiAlertLine className="h-4 w-4" /> Why This Product Could Fail
                </h4>
                <ul className="mt-2 space-y-2">
                  {counterArguments.map((arg, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-rose-900 dark:text-rose-200">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      {arg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hiddenCosts.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  <RiErrorWarningLine className="h-4 w-4" /> Overlooked Hidden Costs
                </h4>
                <ul className="mt-2 space-y-2">
                  {hiddenCosts.map((cost, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {cost}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verification Checklist */}
          {verificationChecklist.length > 0 && (
            <div className="rounded-xl border border-rose-200/60 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                <RiCheckboxCircleLine className="h-4 w-4 text-emerald-500" /> Mandatory Pre-Order Verification Checklist
              </h4>

              <div className="mt-4 space-y-3">
                {verificationChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleCheckitem && onToggleCheckitem(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-xs font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.requiredForBulk && (
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        Required
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
