'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product, ProductStatus, Supplier } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OpportunityScore } from './OpportunityScore'
import { StatusBadge, ALL_STATUSES } from './StatusBadge'
import { InlineEdit } from './InlineEdit'
import { ScoreCard } from './ScoreCard'
import { toast } from 'sonner'
import { updateProduct, updateProductStatus, deleteProduct } from '@/lib/actions/products'
import { formatCurrency } from '@/lib/utils/currency'
import { calculateLandedCostPerUnit } from '@/lib/utils/calculator'
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiFireLine,
  RiBuilding4Line,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiBarChartLine,
} from '@remixicon/react'
import { cn } from '@/lib/utils'

interface ProductDetailClientProps {
  product: Product
  suppliers: Supplier[]
}

export function ProductDetailClient({
  product: initialProduct,
  suppliers,
}: ProductDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [product, setProduct] = useState(initialProduct)
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(product.status)

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

    if (
      [
        'chinaCost',
        'packagingCost',
        'shippingPerUnit',
        'customsPerUnit',
        'otherCosts',
      ].includes(field)
    ) {
      const updatedProduct = { ...product, ...update }
      update.landedCost = calculateLandedCostPerUnit(updatedProduct as Product)
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

  const margin =
    product.sellingPrice > 0 && product.landedCost > 0
      ? ((product.sellingPrice - product.landedCost) / product.sellingPrice) * 100
      : null

  const profit =
    product.sellingPrice > 0 && product.landedCost > 0
      ? product.sellingPrice - product.landedCost
      : 0

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
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

            {/* Tags & Status */}
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
          {/* Visual Economics Flow Strip */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <span className="eyebrow">Landed Cost Flow</span>
              <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
                Unit Economics Breakdown
              </h2>
            </div>

            {/* Horizontal Step-by-step Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center text-center">
              <FlowStep
                label="1. Factory Cost"
                value={`$${product.chinaCost || 0}`}
                onEdit={v => handleFieldUpdate('chinaCost', v)}
                rawVal={product.chinaCost}
              />
              <FlowOperator label="+" />
              <FlowStep
                label="2. Shipping / Unit"
                value={`$${product.shippingPerUnit || 0}`}
                onEdit={v => handleFieldUpdate('shippingPerUnit', v)}
                rawVal={product.shippingPerUnit}
              />
              <FlowOperator label="+" />
              <FlowStep
                label="3. Customs Duty"
                value={`$${product.customsPerUnit || 0}`}
                onEdit={v => handleFieldUpdate('customsPerUnit', v)}
                rawVal={product.customsPerUnit}
              />
              <FlowOperator label="=" />
              <div className="p-3 rounded-lg border-2 border-primary/40 bg-primary/5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Landed Cost
                </span>
                <p className="text-lg font-black font-mono text-primary mt-0.5">
                  ${product.landedCost?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Margin Visualization Bar */}
            {product.sellingPrice > 0 && product.landedCost > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    Landed Cost: <strong>${product.landedCost.toFixed(2)}</strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Gross Profit: <strong>${profit.toFixed(2)}</strong> ({margin?.toFixed(0)}% margin)
                  </span>
                  <span className="text-foreground font-bold">
                    Sell Price: <strong>${product.sellingPrice.toFixed(2)}</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="bg-slate-400 dark:bg-slate-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (product.landedCost / product.sellingPrice) * 100
                      )}%`,
                    }}
                    title={`Cost: $${product.landedCost.toFixed(2)}`}
                  />
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.max(
                        0,
                        100 - (product.landedCost / product.sellingPrice) * 100
                      )}%`,
                    }}
                    title={`Profit: $${profit.toFixed(2)}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Editable Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FieldCard
              label="Packaging Cost"
              value={product.packagingCost}
              prefix="$"
              onSave={v => handleFieldUpdate('packagingCost', v)}
            />
            <FieldCard
              label="Clearing & Other"
              value={product.otherCosts}
              prefix="$"
              onSave={v => handleFieldUpdate('otherCosts', v)}
            />
            <FieldCard
              label="Target Sell Price"
              value={product.sellingPrice}
              prefix="$"
              onSave={v => handleFieldUpdate('sellingPrice', v)}
            />
            <FieldCard
              label="MOQ (Units)"
              value={product.moq}
              onSave={v => handleFieldUpdate('moq', v)}
            />
          </div>
        </TabsContent>

        {/* ─── TAB 2: DEMAND & VIRALITY ─── */}
        <TabsContent value="demand" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <span className="eyebrow">Market Signals</span>
              <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
                Demand & Competition Intelligence
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SignalTile
                label="TikTok Engagement"
                value={
                  product.tiktokViews > 0
                    ? `${(product.tiktokViews / 1_000_000).toFixed(1)}M views`
                    : 'Not tracked'
                }
                sub="Video discovery"
              />
              <SignalTile
                label="Growth Trend"
                value={product.growthTrend || 'Unknown'}
                sub="Social momentum"
                highlight={
                  product.growthTrend === 'Viral'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-foreground'
                }
              />
              <SignalTile
                label="Local Competition"
                value={product.competitionLevel || 'Low'}
                sub="Sri Lanka market"
              />
              <SignalTile
                label="Local Sellers"
                value={`${product.competitorCount || 0} competitors`}
                sub={product.marketplacePresence || 'Daraz / Facebook'}
              />
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border">
              <span className="eyebrow">Competitor Field Notes</span>
              <InlineEdit
                value={product.sriLankanCompetitors}
                onSave={v => handleFieldUpdate('sriLankanCompetitors', v)}
                type="textarea"
                placeholder="Describe competitors in Sri Lanka, local retail prices, and positioning..."
              />
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 3: OPPORTUNITY SCORING ─── */}
        <TabsContent value="score">
          <ScoreCard
            product={product}
            onUpdate={(field: string, val: number) => handleFieldUpdate(field, String(val))}
          />
        </TabsContent>

        {/* ─── TAB 4: NOTES & OVERVIEW ─── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <span className="eyebrow">Product Identity</span>
              <h2 className="text-base font-bold tracking-tight text-foreground mt-0.5">
                Description & Sourcing Observations
              </h2>
            </div>

            <div className="space-y-2">
              <span className="eyebrow">Product Summary</span>
              <InlineEdit
                value={product.description}
                onSave={v => handleFieldUpdate('description', v)}
                type="textarea"
                placeholder="Product description and core value proposition..."
              />
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <span className="eyebrow">Canton Fair & Field Notes</span>
              <InlineEdit
                value={product.notes}
                onSave={v => handleFieldUpdate('notes', v)}
                type="textarea"
                placeholder="Field observations from fair booth or supplier interactions..."
              />
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
                + Link Supplier
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
    </div>
  )
}

function FlowStep({
  label,
  value,
  onEdit,
  rawVal,
}: {
  label: string
  value: string
  onEdit: (v: string) => void
  rawVal: number
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-background text-center">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
        {label}
      </span>
      <p className="text-base font-bold font-mono text-foreground mt-0.5">
        <InlineEdit
          value={rawVal}
          onSave={onEdit}
          type="number"
          prefix="$"
          placeholder="0.00"
          displayClassName="text-base font-bold font-mono"
        />
      </p>
    </div>
  )
}

function FlowOperator({ label }: { label: string }) {
  return (
    <div className="hidden sm:flex items-center justify-center font-bold text-muted-foreground text-sm">
      {label}
    </div>
  )
}

function FieldCard({
  label,
  value,
  prefix,
  onSave,
}: {
  label: string
  value: number
  prefix?: string
  onSave: (v: string) => void
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <span className="eyebrow">{label}</span>
      <div className="mt-1">
        <InlineEdit
          value={value}
          onSave={onSave}
          type="number"
          prefix={prefix}
          placeholder="0"
          displayClassName="text-sm font-mono font-bold"
        />
      </div>
    </div>
  )
}

function SignalTile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub: string
  highlight?: string
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-background">
      <span className="eyebrow">{label}</span>
      <p className={cn('text-sm font-bold mt-1', highlight || 'text-foreground')}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}
