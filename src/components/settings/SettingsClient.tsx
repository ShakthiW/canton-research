'use client'

import { useState, useTransition } from 'react'
import type { Settings } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateExchangeRates, updateFreightSettings, triggerReSeed } from '@/lib/actions/settings'
import {
  RiSettings3Line, RiMoneyDollarCircleLine, RiDatabase2Line,
  RiLoader4Line, RiCheckLine, RiRefreshLine, RiTruckLine,
} from '@remixicon/react'


interface SettingsClientProps {
  settings: Settings
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [rates, setRates] = useState(settings.exchangeRates || {
    USD_TO_LKR: 305,
    CNY_TO_LKR: 42,
    USD_TO_CNY: 7.24,
  })

  const [freight, setFreight] = useState(settings.defaultFreightRate || {
    provider: 'Colombo LCL Express',
    ratePerCbmUsd: 145,
    minimumChargeUsd: 145,
    mode: 'SEA_LCL' as const,
  })

  function handleSaveRates() {
    startTransition(async () => {
      try {
        await updateExchangeRates(rates)
        toast.success('Exchange rates updated!')
      } catch {
        toast.error('Failed to update exchange rates')
      }
    })
  }

  function handleSaveFreight() {
    startTransition(async () => {
      try {
        await updateFreightSettings(freight)
        toast.success('Freight shipping defaults updated!')
      } catch {
        toast.error('Failed to update freight settings')
      }
    })
  }

  function handleReSeed() {
    if (!confirm('Re-seed database? This will refresh all demo products, suppliers, and visits.')) return
    startTransition(async () => {
      try {
        const res = await triggerReSeed()
        toast.success(`Database seeded with ${res.products} products, ${res.suppliers} suppliers!`)
      } catch {
        toast.error('Failed to seed database')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-primary/10 text-primary">
            <RiSettings3Line className="size-5" />
          </span>
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure currency conversion benchmarks, freight forwarder defaults, and database tools
        </p>
      </div>

      {/* Currency Exchange Rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiMoneyDollarCircleLine className="size-5 text-emerald-600" />
            Exchange Rates (LKR Benchmarks)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1 USD to LKR</Label>
              <Input
                type="number"
                value={rates.USD_TO_LKR}
                onChange={e => setRates(r => ({ ...r, USD_TO_LKR: parseFloat(e.target.value) || 0 }))}
                className="h-10 text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1 CNY to LKR</Label>
              <Input
                type="number"
                value={rates.CNY_TO_LKR}
                onChange={e => setRates(r => ({ ...r, CNY_TO_LKR: parseFloat(e.target.value) || 0 }))}
                className="h-10 text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1 USD to CNY</Label>
              <Input
                type="number"
                value={rates.USD_TO_CNY}
                onChange={e => setRates(r => ({ ...r, USD_TO_CNY: parseFloat(e.target.value) || 0 }))}
                className="h-10 text-sm font-semibold"
              />
            </div>
          </div>

          <Button onClick={handleSaveRates} disabled={isPending} className="gap-2">
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
            Save Exchange Rates
          </Button>
        </CardContent>
      </Card>

      {/* Default Freight Forwarder Profile & Rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiTruckLine className="size-5 text-indigo-600" />
            Preferred Freight Forwarder & Shipping Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Default shipping rate profile used by the intelligence orchestrator when calculating landed costs from China to Sri Lanka.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Forwarder / Provider Name</Label>
              <Input
                value={freight.provider}
                onChange={e => setFreight(f => ({ ...f, provider: e.target.value }))}
                placeholder="e.g. Colombo LCL Express"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sea LCL Rate ($ USD / CBM)</Label>
              <Input
                type="number"
                value={freight.ratePerCbmUsd}
                onChange={e => setFreight(f => ({ ...f, ratePerCbmUsd: parseFloat(e.target.value) || 0 }))}
                className="h-10 text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Minimum Charge ($ USD)</Label>
              <Input
                type="number"
                value={freight.minimumChargeUsd}
                onChange={e => setFreight(f => ({ ...f, minimumChargeUsd: parseFloat(e.target.value) || 0 }))}
                className="h-10 text-sm font-semibold"
              />
            </div>
          </div>

          <Button onClick={handleSaveFreight} disabled={isPending} className="gap-2">
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
            Save Freight Defaults
          </Button>
        </CardContent>
      </Card>


      {/* Demo Seed Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiDatabase2Line className="size-5 text-blue-600" />
            Demo Data & Atlas Seeding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Populate your MongoDB Atlas cluster with realistic viral products, Guangzhou/Shenzhen suppliers, sample tracking flows, and Canton Fair booth visits.
          </p>
          <Button variant="outline" onClick={handleReSeed} disabled={isPending} className="gap-2">
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiRefreshLine className="size-4" />}
            Reset & Seed Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
