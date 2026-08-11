'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Fair, FairVisit, Supplier, ProductListItem, FairZone } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FairZoneModal } from './FairZoneModal'
import {
  RiFlashlightLine,
  RiStarLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiDownload2Line,
  RiSearchLine,
  RiBox3Line,
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiFileTextLine,
  RiQuestionLine,
} from '@remixicon/react'

interface FairClientProps {
  fairs: Fair[]
  visits: FairVisit[]
  zones?: FairZone[]
  suppliers: Supplier[]
  products: ProductListItem[]
}

export function FairClient({ fairs, visits = [], zones = [], suppliers = [], products = [] }: FairClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterest, setSelectedInterest] = useState<string>('ALL')
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [localZones, setLocalZones] = useState<FairZone[]>(zones)

  const activeFair = fairs[0] || {
    _id: 'canton-140',
    name: '140th Canton Fair',
    location: 'Guangzhou, China',
    phase: 'Phase 1',
  }

  // Calculate Live Field KPIs
  const totalVisits = visits.length
  const shortlistedVisits = visits.filter(v => v.interestLevel === 'Shortlisted')
  const samplesRequested = visits.filter(v => (v.sampleCostUsd || 0) > 0).length
  const avgQuotedPrice = visits.length > 0
    ? visits.reduce((acc, v) => acc + (v.priceQuoted || 0), 0) / visits.length
    : 0

  // ── Dynamic Trade Negotiation Field Guide Parameters ──
  const allLeadTimes: number[] = [
    ...visits.map(v => v.leadTimeDays).filter((n): n is number => typeof n === 'number' && n > 0),
    ...suppliers.map(s => parseInt(s.leadTime || '')).filter(n => !isNaN(n) && n > 0),
    ...products.map(p => (p as unknown as { leadTimeDays?: number }).leadTimeDays).filter((n): n is number => typeof n === 'number' && n > 0),
  ]

  let leadTimeText = 'No Data Captured'
  let leadTimeSubtext = 'Log booth findings to calculate average production lead times.'
  if (allLeadTimes.length > 0) {
    const minLead = Math.min(...allLeadTimes)
    const maxLead = Math.max(...allLeadTimes)
    leadTimeText = minLead === maxLead ? `${minLead} Days Avg` : `${minLead} – ${maxLead} Days Avg`
    leadTimeSubtext = `Calculated from ${allLeadTimes.length} recorded quote${allLeadTimes.length > 1 ? 's' : ''}.`
  }

  // Custom Packaging & OEM
  const totalOemTracked = visits.length + suppliers.length
  const oemWillingCount =
    visits.filter(v => v.customPackagingAvailable).length +
    suppliers.filter(s => s.customization || s.packagingCustomization || s.privateLabeling).length

  let oemText = 'No Data Captured'
  let oemSubtext = 'Log supplier findings to track OEM & custom packaging availability.'
  if (totalOemTracked > 0) {
    const oemPct = Math.round((oemWillingCount / totalOemTracked) * 100)
    oemText = `${oemPct}% Factories Willing`
    oemSubtext = `${oemWillingCount} of ${totalOemTracked} recorded supplier${totalOemTracked > 1 ? 's' : ''} accept OEM/custom packaging.`
  }

  // Sample Policy
  const allSampleCosts: number[] = [
    ...visits.map(v => v.sampleCostUsd).filter((n): n is number => typeof n === 'number' && n > 0),
    ...suppliers.map(s => s.sampleCost).filter((n): n is number => typeof n === 'number' && n > 0),
  ]

  let sampleText = 'No Data Captured'
  let sampleSubtext = 'Log sample quotes to calculate average sample costs.'
  if (allSampleCosts.length > 0) {
    const minSample = Math.min(...allSampleCosts)
    const maxSample = Math.max(...allSampleCosts)
    sampleText = minSample === maxSample ? `$${minSample} USD / Sample` : `$${minSample} – $${maxSample} USD / Sample`
    sampleSubtext = `Calculated across ${allSampleCosts.length} sample quote${allSampleCosts.length > 1 ? 's' : ''}.`
  }

  // Payment Terms
  const allTerms = [
    ...visits.map(v => v.paymentTerms).filter(Boolean),
    ...suppliers.map(s => s.paymentTerms).filter(Boolean),
  ] as string[]

  let paymentText = 'No Data Captured'
  let paymentSubtext = 'Log payment terms negotiated at Canton Fair.'
  if (allTerms.length > 0) {
    const counts: Record<string, number> = {}
    allTerms.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    const sortedTerms = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    if (sortedTerms[0]) {
      paymentText = sortedTerms[0]
      paymentSubtext = `Most common terms across ${allTerms.length} booth negotiation${allTerms.length > 1 ? 's' : ''}.`
    }
  }

  // ── Dynamic Exhibition Hall Analytics Matrix ──
  const activeHallsCount = localZones.filter(z =>
    visits.some(v => v.hall === z.hallId) || suppliers.some(s => s.boothNumber?.includes(z.hallId) || s.hall === z.hallId)
  ).length

  // Filter Visits
  const filteredVisits = visits.filter(v => {
    const matchesSearch =
      v.boothNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.hall || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesInterest =
      selectedInterest === 'ALL' ? true : v.interestLevel === selectedInterest

    return matchesSearch && matchesInterest
  })

  function handleExportDossier() {
    toast.success('Exporting Canton Fair Floor Dossier (CSV/PDF)...')
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12 space-y-8 select-none">
      {/* 1. Canton Fair Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 mb-2">
            <RiFlashlightLine className="size-3.5" />
            <span>Field Operations · Guangzhou Trade Hub</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            {activeFair.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {activeFair.location} · {activeFair.phase} · Trade Show Floor Intelligence & Supplier Operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products/capture?source=CANTON_FAIR"
            className="inline-flex items-center justify-center h-11 px-5 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all"
          >
            <RiAddLine className="size-4" />
            <span>Capture Canton Fair Finding</span>
          </Link>

          <Button
            variant="outline"
            onClick={handleExportDossier}
            className="h-11 px-4 text-xs font-semibold gap-2 rounded-xl"
          >
            <RiDownload2Line className="size-4" />
            <span>Export Dossier</span>
          </Button>
        </div>

      </div>


      {/* 2. Live Field Operations KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Booths Visited</span>
              <p className="text-2xl font-black text-foreground mt-1 font-mono">{totalVisits}</p>
            </div>
            <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RiBuilding2Line className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shortlisted Factories</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">{shortlistedVisits.length}</p>
            </div>
            <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RiStarLine className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Samples Requested</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{samplesRequested}</p>
            </div>
            <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <RiBox3Line className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg. Quoted FOB</span>
              <p className="text-2xl font-black text-foreground mt-1 font-mono">${avgQuotedPrice.toFixed(2)}</p>
            </div>
            <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <RiMoneyDollarCircleLine className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Section 1: Exhibition Hall & Zone Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <RiBuilding2Line className="size-5 text-indigo-600" />
            Exhibition Hall Analytics Matrix
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{activeHallsCount > 0 ? `${activeHallsCount} Active Zones Visited` : '0 Active Zones Visited'}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsZoneModalOpen(true)}
              className="h-8 px-3 text-xs font-bold gap-1 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <RiAddLine className="size-3.5" />
              <span>Add Zone</span>
            </Button>
          </div>
        </div>

        {localZones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {localZones.map(zone => {
              const hallVisits = visits.filter(v => v.hall === zone.hallId)
              const hallShortlisted = hallVisits.filter(v => v.interestLevel === 'Shortlisted').length
              return (
                <Card key={zone._id} className="border-border shadow-xs hover:border-primary/40 transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl border text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900">
                        <RiFlashlightLine className="size-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono font-bold">
                        {hallVisits.length} Visits
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground">{zone.hallId}</h3>
                      <p className="text-xs text-muted-foreground">{zone.name}</p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Shortlisted:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{hallShortlisted} Factories</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-card border border-dashed border-border rounded-2xl space-y-3">
            <RiBuilding2Line className="size-8 text-muted-foreground/50 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-foreground">No Exhibition Zones Added Yet</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Create your exhibition hall zones to track visits and factory shortlisted statistics per hall.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsZoneModalOpen(true)}
              className="text-xs font-bold gap-1.5 rounded-xl mx-auto"
            >
              <RiAddLine className="size-4" />
              <span>Add Your First Exhibition Zone</span>
            </Button>
          </div>
        )}
      </div>

      {/* 4. Section 2: Trade Show Sourcing Field Guide & Questions */}
      <Card className="border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/20 via-background to-background shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <RiQuestionLine className="size-5 text-emerald-600" />
            <span>Canton Fair Trade Negotiation Field Guide & Captured Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Production Lead Times</span>
              <p className="font-bold text-foreground text-sm">{leadTimeText}</p>
              <p className="text-[11px] text-muted-foreground">{leadTimeSubtext}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Custom Packaging & OEM</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{oemText}</p>
              <p className="text-[11px] text-muted-foreground">{oemSubtext}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Sample Policy</span>
              <p className="font-bold text-foreground text-sm">{sampleText}</p>
              <p className="text-[11px] text-muted-foreground">{sampleSubtext}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Payment Terms</span>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{paymentText}</p>
              <p className="text-[11px] text-muted-foreground">{paymentSubtext}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Section 3: Searchable Floor Stream & Supplier Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <RiFileTextLine className="size-5 text-indigo-600" />
              Canton Fair Floor Directory & Log Stream
            </h2>
            <p className="text-xs text-muted-foreground">Search and manage recorded booth visits from Guangzhou</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search booth #, product, hall..."
                className="pl-9 h-10 text-xs rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'Shortlisted', 'Interesting', 'Follow Up', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedInterest(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedInterest === tab
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {tab === 'ALL' ? 'All Visited Booths' : tab}
            </button>
          ))}
        </div>

        {/* Booth Visit Stream Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisits.map((visit, idx) => (
            <Card key={visit._id} className="border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">#{String(idx + 1).padStart(2, '0')}</span>
                    <Badge variant="secondary" className="font-mono font-extrabold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Booth {visit.boothNumber}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">{visit.hall}</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase ${
                      visit.interestLevel === 'Shortlisted'
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {visit.interestLevel}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{visit.productName || 'Unnamed Booth Product'}</h3>
                  {visit.supplierName && (
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">{visit.supplierName}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/30 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">FOB Quote</span>
                    <span className="font-bold text-primary">${visit.priceQuoted?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">MOQ</span>
                    <span className="font-bold text-foreground">{visit.moq || 100} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-sans font-semibold">Lead Time</span>
                    <span className="font-bold text-foreground">{visit.leadTimeDays || 15} days</span>
                  </div>
                </div>

                {visit.notes && (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded-xl border border-border/50">
                    &quot;{visit.notes}&quot;

                  </p>
                )}

                {visit.contactInfo && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">WeChat / Phone:</span>
                    <span className="font-mono bg-background px-2 py-0.5 rounded border border-border">{visit.contactInfo}</span>
                  </div>
                )}
              </CardContent>

              <div className="px-5 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">OEM Packaging: {visit.customPackagingAvailable ? 'Available ✓' : 'No'}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`Booth ${visit.boothNumber} linked to Product Catalog!`)}
                  className="text-xs font-bold gap-1 rounded-xl"
                >
                  <span>Convert to Product</span>
                  <RiArrowRightLine className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}

          {filteredVisits.length === 0 && (
            <div className="col-span-full p-12 text-center bg-card border border-border rounded-2xl space-y-3">
              <RiBuilding2Line className="size-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No Booth Visits Found</h3>
              <p className="text-xs text-muted-foreground">Capture Canton Fair findings using the + Capture Canton Fair Finding button above.</p>

            </div>
          )}
        </div>
      </div>

      <FairZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        onCreated={newZone => setLocalZones(prev => [...prev, newZone])}
      />
    </div>
  )
}


