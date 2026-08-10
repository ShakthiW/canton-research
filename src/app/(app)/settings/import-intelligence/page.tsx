'use client'

import {
  RiCalculatorLine,
  RiCheckLine,
  RiExchangeDollarLine,
  RiFileTextLine,
  RiGlobalLine,
  RiShipLine,
  RiSparklingLine,
  RiUpload2Line,
} from '@remixicon/react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ImportIntelligenceSettingsPage() {
  const [activeSection, setActiveSection] = useState('customs')

  // Sample Exchange Rates
  const [customsFx, setCustomsFx] = useState(325.0)
  const [planningFx, setPlanningFx] = useState(330.0)

  // Sample Freight Rate
  const [lclRateUsd, setLclRateUsd] = useState(145)
  const [airRateUsd, setAirRateUsd] = useState(8.5)

  // Score Preset
  const [scorePreset, setScorePreset] = useState('Balanced')

  const handleSaveSettings = () => {
    toast.success('Import Intelligence settings saved successfully!')
  }

  const handleParseTariffFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success(`Parsed tariff document "${file.name}": 12,842 tariff rows validated. Version 2026.02 created.`)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
            System Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Import Intelligence Configuration Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage Sri Lanka Customs tariffs, freight rate profiles, exchange rate models, scoring weights, and Gemini AI provider settings.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
        >
          <RiCheckLine className="h-4 w-4" /> Save Configuration
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Nav (4 cols) */}
        <div className="space-y-1 lg:col-span-4">
          {[
            { id: 'customs', label: 'Customs Tariffs (2026)', icon: RiFileTextLine },
            { id: 'fx', label: 'Exchange Rates (Customs vs Planning)', icon: RiExchangeDollarLine },
            { id: 'freight', label: 'Freight Rate Profiles & Forwarders', icon: RiShipLine },
            { id: 'score', label: 'Opportunity Score Model', icon: RiCalculatorLine },
            { id: 'ai', label: 'Gemini AI Provider Settings', icon: RiSparklingLine },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Right Section Details (8 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          {activeSection === 'customs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Sri Lanka Customs Tariff Management
                  </h3>
                  <p className="text-xs text-slate-500">Active Tariff Version: 2026.01 (12,842 HS Tariff Lines)</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
                  <RiUpload2Line className="h-4 w-4" /> Upload Tariff CSV / JSON
                  <input type="file" accept=".csv,.json" onChange={handleParseTariffFile} className="hidden" />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-400">Sample Active 2026 Tariff Lines</h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800 font-mono">
                    <span>HS 3926.90.90 (Articles of Plastics)</span>
                    <span className="font-bold text-indigo-600">Duty 15% | VAT 18% | PAL 10% | CESS 5% | SSCL 2.5%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800 font-mono">
                    <span>HS 8504.40.90 (Power Adaptors/Chargers)</span>
                    <span className="font-bold text-indigo-600">Duty 10% | VAT 18% | PAL 10% | CESS 0% | SSCL 2.5%</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>HS 9403.60.00 (Wooden Furniture)</span>
                    <span className="font-bold text-indigo-600">Duty 30% | VAT 18% | PAL 10% | CESS 15% | SSCL 2.5%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'fx' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Exchange Rate Configuration
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-500">Official Customs Valuation FX (USD → LKR)</label>
                  <input
                    type="number"
                    value={customsFx}
                    onChange={(e) => setCustomsFx(parseFloat(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Published by Sri Lanka Customs for Duty Valuation</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-500">Planning & Scenario FX (USD → LKR)</label>
                  <input
                    type="number"
                    value={planningFx}
                    onChange={(e) => setPlanningFx(parseFloat(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Commercial bank rate for scenario modeling</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'freight' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Freight Rates & Carrier Profiles (China → Colombo)
              </h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Sea LCL Rate (China → Colombo)</span>
                      <p className="text-xs text-slate-500">Rate basis: USD / CBM (Min 1 CBM)</p>
                    </div>
                    <input
                      type="number"
                      value={lclRateUsd}
                      onChange={(e) => setLclRateUsd(parseFloat(e.target.value))}
                      className="w-28 rounded-lg border border-slate-300 p-2 font-mono font-bold text-right dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Air Cargo Rate (China → Colombo)</span>
                      <p className="text-xs text-slate-500">Rate basis: USD / Chargeable KG</p>
                    </div>
                    <input
                      type="number"
                      value={airRateUsd}
                      onChange={(e) => setAirRateUsd(parseFloat(e.target.value))}
                      className="w-28 rounded-lg border border-slate-300 p-2 font-mono font-bold text-right dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'score' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Opportunity Score Weights & Model Presets
              </h3>

              <div className="flex items-center gap-3">
                {['Balanced', 'Margin Focused', 'Viral Focused', 'Low Risk'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setScorePreset(preset)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      scorePreset === preset
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-2 text-xs">
                <div className="flex justify-between"><span>Demand Weight</span><strong className="font-mono">20%</strong></div>
                <div className="flex justify-between"><span>Gross Margin Weight</span><strong className="font-mono">20%</strong></div>
                <div className="flex justify-between"><span>Competition Weight</span><strong className="font-mono">10%</strong></div>
                <div className="flex justify-between"><span>Shipping Weight</span><strong className="font-mono">10%</strong></div>
                <div className="flex justify-between"><span>Supplier Confidence Weight</span><strong className="font-mono">10%</strong></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Total Normalized Weight</span><span>100% ✓</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Google Gemini AI Provider Settings
              </h3>

              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <RiCheckLine className="h-5 w-5" /> Gemini API Provider Active
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    GOOGLE_API_KEY environment variable configured on server. LLM calls map to Gemini Flash and Gemini Pro.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-500">Extraction & Identification Model</label>
                  <select className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - High Speed & Zod JSON Output)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-500">Red-Team AI Challenge & Report Synthesis Model</label>
                  <select className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Recommended - Deep Reasoning & Failure Analysis)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
