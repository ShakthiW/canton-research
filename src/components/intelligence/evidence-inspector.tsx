'use client'

import { ProductIntelligenceState } from '@/types/intelligence'
import { RiCheckDoubleLine, RiEdit2Line, RiExternalLinkLine, RiShieldUserLine } from '@remixicon/react'

interface EvidenceInspectorProps {
  intelligence?: ProductIntelligenceState
  onSaveOverride?: (field: string, value: unknown) => void
}

export function EvidenceInspector({ intelligence, onSaveOverride }: EvidenceInspectorProps) {
  if (!intelligence) return null

  const fields = [
    { label: 'Canonical Name', prov: intelligence.canonicalName, fieldKey: 'canonicalName' },
    { label: 'Category', prov: intelligence.category, fieldKey: 'category' },
    { label: 'Material', prov: intelligence.material, fieldKey: 'material' },
    { label: 'Unit Weight (kg)', prov: intelligence.unitWeightKg, fieldKey: 'unitWeightKg' },
    { label: 'MOQ', prov: intelligence.moq, fieldKey: 'moq' },
    { label: 'HS Classification', prov: intelligence.hsCode, fieldKey: 'hsCode' },
  ]

  const getSourceBadge = (sourceType?: string) => {
    switch (sourceType) {
      case 'OFFICIAL':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
      case 'USER_ENTERED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
      case 'AI_INFERENCE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <RiShieldUserLine className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Data Provenance & Evidence Audit Trail
        </h3>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => {
          const val = f.prov?.effectiveValue
          const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val || 'UNKNOWN')
          const isUser = f.prov?.sourceType === 'USER_ENTERED'

          return (
            <div
              key={f.label}
              className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{f.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getSourceBadge(f.prov?.sourceType)}`}>
                    {isUser ? '🔵 User Provided' : '🟡 AI Estimated'}
                  </span>
                </div>

                <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {displayVal}
                </div>

                {f.prov?.aiValue && isUser && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Original AI Value: {String(f.prov.aiValue)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800">
                <span>Confidence: {f.prov ? `${Math.round(f.prov.confidence * 100)}%` : '80%'}</span>
                {onSaveOverride && (
                  <button
                    onClick={() => {
                      const inputVal = prompt(`Enter manual override value for ${f.label}:`, displayVal)
                      if (inputVal !== null) {
                        onSaveOverride(f.fieldKey, inputVal)
                      }
                    }}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <RiEdit2Line className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
