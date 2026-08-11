'use client'

import { useState, useTransition, useOptimistic, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product, ProductStatus, Supplier, Settings } from '@/types'
import type { ProductIntelligenceState, ResearchRun } from '@/types/intelligence'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { OpportunityScore } from './OpportunityScore'
import { StatusBadge, ALL_STATUSES } from './StatusBadge'
import { InlineEdit } from './InlineEdit'
import { ScoreCard } from './ScoreCard'
import { toast } from 'sonner'
import { updateProduct, updateProductStatus, deleteProduct } from '@/lib/actions/products'
import { LiveResearchDrawer } from '@/components/intelligence/live-research-drawer'
import { LandedCostWaterfall } from '@/components/intelligence/landed-cost-waterfall'
import { WhatIfCalculator } from '@/components/intelligence/what-if-calculator'
import { EvidenceInspector } from '@/components/intelligence/evidence-inspector'
import { AIChallengeCard } from '@/components/intelligence/ai-challenge-card'
import { UnitEconomicsBreakdown } from '@/components/intelligence/unit-economics-breakdown'
import { DemandViralityCard } from '@/components/intelligence/demand-virality-card'

import { SourcingDossierModal } from './SourcingDossierModal'
import { FormattedNotes } from '@/components/common/FormattedNotes'
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiFireLine,
  RiBuilding4Line,
  RiSparklingLine,
  RiPrinterLine,
} from '@remixicon/react'

import { cn } from '@/lib/utils'


interface ProductDetailClientProps {
  product: Product
  suppliers: Supplier[]
  settings?: Settings
}

export function ProductDetailClient({
  product: initialProduct,
  suppliers,
  settings,
}: ProductDetailClientProps) {

  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [product, setProduct] = useState(initialProduct)
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(product.status)

  useEffect(() => {
    const timer = setTimeout(() => setProduct(initialProduct), 0)
    return () => clearTimeout(timer)
  }, [initialProduct])


  async function handleFieldUpdate(field: string, value: string) {
    const numericFields = [
      'chinaCost',
      'moq',
      'sampleCost',
      'packagingCost',
      'shippingPerUnit',
      'customsPerUnit',
      'otherCosts',
      'landedCost',
      'sellingPrice',
      'tiktokViews',
      'googleTrendsScore',
      'competitorCount',
      'demandConfidence',
    ]
    const update: Record<string, unknown> = {}

    if (numericFields.includes(field)) {
      update[field] = parseFloat(value) || 0
    } else if (field === 'viralStatus' || field === 'localAvailability') {
      update[field] = value === 'true'
    } else {
      update[field] = value
    }

    setProduct(prev => ({ ...prev, ...update } as Product))

    try {
      await updateProduct(
        product._id,
        update as Parameters<typeof updateProduct>[1]
      )
    } catch {
      setProduct(initialProduct)
      toast.error("Couldn't save field")
    }
  }

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      setOptimisticStatus(newStatus as ProductStatus)
      try {
        await updateProductStatus(
          product._id,
          newStatus as ProductStatus,
          product.status
        )
        setProduct(prev => ({ ...prev, status: newStatus as ProductStatus }))
        toast.success(`Status updated to ${newStatus}`)
      } catch {
        toast.error("Couldn't update status")
      }
    })
  }

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteProduct(product._id)
        toast.success('Product deleted')
        router.push('/products')
      } catch {
        toast.error("Couldn't delete product")
      }
    })
  }

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDossierOpen, setIsDossierOpen] = useState(false)
  const [activeRun, setActiveRun] = useState<ResearchRun | null>(null)

  const intelligenceState = (product as unknown as { intelligence?: ProductIntelligenceState }).intelligence
  const hasBeenAnalyzed = Boolean(
    product.isAiAnalyzed ||
    product.lastResearchedAt ||
    intelligenceState?.lastResearchedAt
  )


  async function handleTriggerResearch(type: 'QUICK' | 'DEEP' | 'MODULE') {
    if (isAnalyzing) return

    if (hasBeenAnalyzed && !confirm('This product has already been analyzed by AI. Re-running will update all calculations and findings. Proceed?')) {
      return
    }

    setIsAnalyzing(true)
    setIsDrawerOpen(true)
    try {
      const res = await fetch('/api/intelligence/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, type }),
      })
      const data = await res.json()
      if (data.runId) {
        const interval = setInterval(async () => {
          const statusRes = await fetch(`/api/intelligence/research?runId=${data.runId}`)
          const runData = await statusRes.json()
          setActiveRun(runData)
          if (runData.status === 'COMPLETED' || runData.status === 'FAILED') {
            clearInterval(interval)
            setIsAnalyzing(false)

            // Immediately fetch fresh product document from server and update local state
            try {
              const freshRes = await fetch(`/api/products/${product._id}`)
              if (freshRes.ok) {
                const freshData = await freshRes.json()
                if (freshData) {
                  setProduct(freshData)
                }
              }
            } catch {}

            router.refresh()
          }
        }, 2000)
      }
    } catch {
      setIsAnalyzing(false)
      toast.error('Failed to trigger research run')
    }
  }

  async function handleSaveOverride(field: string, value: unknown) {
    try {
      const res = await fetch(`/api/intelligence/product/${product._id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const data = await res.json()
      if (data.intelligence) {
        setProduct((prev) => ({
          ...prev,
          intelligence: data.intelligence,
          score: data.intelligence.opportunityScore?.finalScore ?? prev.score,
          landedCost: data.intelligence.landedCost?.landedCostPerUnitLkr ?? prev.landedCost,
        } as Product))
        toast.success('Calculations updated from manual override')
      }
    } catch {
      toast.error('Failed to apply override')
    }
  }

  const margin =
    product.sellingPrice > 0 && product.landedCost > 0
      ? ((product.sellingPrice - product.landedCost) / product.sellingPrice) * 100
      : null

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
      <LiveResearchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeRun={activeRun}
      />


      {/* 1. Header & Navigation Dossier */}

      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => router.back()}
            aria-label="Back"
            className="text-muted-foreground hover:text-foreground"
          >
            <RiArrowLeftLine className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="eyebrow">Dossier</span>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {product._id.slice(-6)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsDossierOpen(true)}
            className="gap-1.5 text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            <RiPrinterLine className="size-3.5" />
            <span>Export Dossier (PDF)</span>
          </Button>

          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'gap-1.5 text-xs'
              )}
            >
              <RiExternalLinkLine className="size-3.5" />
              Source Platform
            </a>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            <RiDeleteBinLine className="size-4" />
          </Button>
        </div>
      </div>

      {/* 2. Split Hero Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-card rounded-lg border border-border p-5">
        {/* Left: Product Image (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="aspect-4/3 w-full rounded-md border border-border bg-muted/60 overflow-hidden flex items-center justify-center relative">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="text-center p-4">
                <RiBuilding4Line className="size-8 mx-auto text-muted-foreground/30 mb-1" />
                <span className="text-xs text-muted-foreground">No image added</span>
              </div>
            )}
            {product.viralStatus && (
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                <RiFireLine className="size-3" /> Viral Signal
              </div>
            )}
          </div>
        </div>

        {/* Right: Identity & High-Level Intelligence (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="eyebrow">{product.category}</span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  <InlineEdit
                    value={product.name}
                    onSave={v => handleFieldUpdate('name', v)}
                    placeholder="Product name"
                    displayClassName="text-xl sm:text-2xl font-black"
                  />
                </h1>
              </div>
              <OpportunityScore score={product.score} size="md" />
            </div>

            {/* Tags & Status + Analyze Button */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Select
                value={optimisticStatus}
                onValueChange={v => {
                  if (v) handleStatusChange(v)
                }}
              >
                <SelectTrigger className="h-7 text-xs w-[170px] bg-background">
                  <StatusBadge
                    status={optimisticStatus as ProductStatus}
                    size="sm"
                  />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="text-xs">
                      <StatusBadge status={s} size="sm" />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {product.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/70"
                >
                  #{tag}
                </span>
              ))}

              <Button
                size="xs"
                onClick={() => handleTriggerResearch('QUICK')}
                disabled={isAnalyzing}
                className={cn(
                  "h-7 text-xs gap-1.5 font-semibold shadow sm:ml-auto transition-all",
                  hasBeenAnalyzed
                    ? "bg-muted/80 hover:bg-muted text-foreground border border-border"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                )}
              >
                <RiSparklingLine className={cn("size-3.5 text-indigo-500", isAnalyzing && "animate-spin")} />
                {isAnalyzing ? "Analyzing..." : hasBeenAnalyzed ? "✓ Re-Analyze AI" : "✨ Analyze with AI"}
              </Button>

            </div>
          </div>

          {/* Key Intelligence Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/80">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                China Cost
              </span>
              <p className="text-sm font-mono font-bold mt-0.5">
                ${product.chinaCost ? product.chinaCost.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Est. Landed
              </span>
              <p className="text-sm font-mono font-bold text-primary mt-0.5">
                ${product.landedCost ? product.landedCost.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Target Sell
              </span>
              <p className="text-sm font-mono font-bold mt-0.5">
                ${product.sellingPrice ? product.sellingPrice.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Gross Margin
              </span>
              <p
                className={cn(
                  'text-sm font-mono font-bold mt-0.5',
                  margin !== null
                    ? margin >= 50
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : margin >= 30
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-500'
                    : 'text-muted-foreground'
                )}
              >
                {margin !== null ? `${margin.toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sticky Tab Navigation */}
      <Tabs defaultValue="economics" className="space-y-4">
        <div className="sticky top-13 z-10 bg-background/95 backdrop-blur border-b border-border py-1">
          <TabsList className="bg-muted/50 p-1 rounded-md h-9">
            <TabsTrigger value="economics" className="text-xs font-semibold">
              Economics
            </TabsTrigger>
            <TabsTrigger value="demand" className="text-xs font-semibold">
              Demand & Virality
            </TabsTrigger>
            <TabsTrigger value="score" className="text-xs font-semibold">
              Opportunity Scoring
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-xs font-semibold">
              Notes & Dossier
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs font-semibold">
              Suppliers ({product.supplierIds?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB 1: ECONOMICS FLOW ─── */}
        <TabsContent value="economics" className="space-y-5">
          {/* Landed Cost Waterfall Engine */}
          <LandedCostWaterfall
            landedCost={intelligenceState?.landedCost}
            customs={intelligenceState?.customs}
          />

          {/* What-If Product Economics Simulator */}
          <WhatIfCalculator
            initialFobPriceUsd={product.chinaCost || 3.5}
            initialQuantity={product.moq || 100}
            initialSellingPriceLkr={product.sellingPrice || 4490}
            initialFreight={intelligenceState?.freight}
            exchangeRate={settings?.exchangeRates?.USD_TO_LKR || 305}
          />

          {/* Unit Economics Breakdown with USD/LKR Toggle & Exact Math */}
          <UnitEconomicsBreakdown
            chinaCostUsd={product.chinaCost}
            shippingPerUnitUsd={product.shippingPerUnit}
            customsPerUnitUsd={product.customsPerUnit}
            landedCostLkr={product.landedCost}
            landedCost={intelligenceState?.landedCost}
            customs={intelligenceState?.customs}
            freight={intelligenceState?.freight}
            exchangeRate={settings?.exchangeRates?.USD_TO_LKR || 305}
            onEditField={(field: string, val: string) => handleFieldUpdate(field, val)}
          />

        </TabsContent>

        {/* ─── TAB 2: DEMAND & VIRALITY ─── */}
        <TabsContent value="demand" className="space-y-4">
          <DemandViralityCard
            productName={product.name}
            category={product.category}
            tiktokViews={product.tiktokViews}
            growthTrend={product.growthTrend}
            competitionLevel={product.competitionLevel}
            competitorCount={product.competitorCount}
            sriLankanCompetitors={product.sriLankanCompetitors}
            intelligence={intelligenceState}
            isAnalyzing={isAnalyzing}
            onTriggerResearch={() => handleTriggerResearch('QUICK')}
          />

        </TabsContent>


        {/* ─── TAB 3: OPPORTUNITY SCORING ─── */}
        <TabsContent value="score" className="space-y-5">
          <ScoreCard
            product={product}
            onUpdate={(field: string, val: number) => handleFieldUpdate(field, String(val))}
          />

          <AIChallengeCard
            counterArguments={intelligenceState?.aiChallenge?.counterArguments}
            hiddenCosts={intelligenceState?.aiChallenge?.hiddenCosts}
            failureModes={intelligenceState?.aiChallenge?.failureModes}
            verificationChecklist={intelligenceState?.verificationChecklist}
            hasBeenAnalyzed={hasBeenAnalyzed}
            isAnalyzing={isAnalyzing}
            onTriggerResearch={() => handleTriggerResearch('QUICK')}
          />

        </TabsContent>

        {/* ─── TAB 4: NOTES & DOSSIER ─── */}
        <TabsContent value="overview" className="space-y-4">
          <EvidenceInspector
            intelligence={intelligenceState}
            onSaveOverride={handleSaveOverride}
          />

          <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
            <div>
              <span className="eyebrow">Product Identity</span>
              <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
                Description & Sourcing Observations
              </h2>
            </div>

            {/* Product Summary Block Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-xs font-bold text-foreground">PRODUCT SUMMARY</span>
                <span className="text-[10px] text-muted-foreground">Click box to edit</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/80 hover:bg-background transition-all min-h-[90px]">
                <InlineEdit
                  value={product.description}
                  onSave={v => handleFieldUpdate('description', v)}
                  type="textarea"
                  placeholder="Product description and core value proposition..."
                  displayClassName="text-sm leading-relaxed text-foreground whitespace-pre-wrap block w-full"
                />
              </div>
            </div>

            {/* Canton Fair & Field Notes Block Card */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-xs font-bold text-foreground">CANTON FAIR & FIELD NOTES</span>
                <span className="text-[10px] text-muted-foreground">Click box to edit</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/80 hover:bg-background transition-all space-y-3">
                <InlineEdit
                  value={product.notes}
                  onSave={v => handleFieldUpdate('notes', v)}
                  type="textarea"
                  placeholder="Field observations from fair booth, booth numbers, or supplier interactions..."
                  displayClassName="text-sm leading-relaxed text-foreground whitespace-pre-wrap block w-full"
                />
                {product.notes?.includes('![Attachment]') && (
                  <div className="pt-3 border-t border-border/60">
                    <FormattedNotes text={product.notes} additionalImages={product.images} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </TabsContent>


        {/* ─── TAB 5: SUPPLIERS ─── */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">Supply Chain</span>
                <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
                  Linked Chinese Manufacturers
                </h2>
              </div>
              <Link
                href="/suppliers"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'text-xs')}
              >
                Link Supplier
              </Link>
            </div>

            {product.supplierIds && product.supplierIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.supplierIds.map(sId => {
                  const supplier = suppliers.find(s => s._id === sId)
                  if (!supplier) return null
                  return (
                    <Link
                      key={sId}
                      href={`/suppliers/${sId}`}
                      className="p-3.5 rounded border border-border hover:border-primary/50 bg-background transition-colors block group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {supplier.companyName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {supplier.city} · Booth {supplier.boothNumber || '—'}
                          </p>
                        </div>
                        <span className="text-xs font-bold font-mono text-primary">
                          Score {supplier.score}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground font-mono">
                        <span>MOQ: {supplier.moq || '—'}</span>
                        <span>Lead: {supplier.leadTime || '—'}</span>
                        {supplier.wechat && <span>WeChat: {supplier.wechat}</span>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded text-xs text-muted-foreground">
                No Chinese suppliers linked to this product yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SourcingDossierModal
        open={isDossierOpen}
        onOpenChange={setIsDossierOpen}
        product={product}
        supplierInfo={
          suppliers[0]
            ? {
                companyName: suppliers[0].companyName,
                boothNumber: suppliers[0].boothNumber,
                wechatId: suppliers[0].wechat,
                contactInfo: suppliers[0].phone,
              }
            : undefined
        }
      />
    </div>
  )
}
