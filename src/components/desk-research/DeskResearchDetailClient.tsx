'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product, Settings } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/products/StatusBadge'
import { UnitEconomicsBreakdown } from '@/components/intelligence/unit-economics-breakdown'
import { WhatIfCalculator } from '@/components/intelligence/what-if-calculator'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import { formatCurrency } from '@/lib/utils/currency'
import { toast } from 'sonner'
import {
  RiArrowLeftLine,
  RiSearchEyeLine,
  RiExternalLinkLine,
  RiBuildingLine,
  RiVideoLine,
  RiStore2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiStarLine,
  RiSparklingLine,
  RiPriceTag3Line,
} from '@remixicon/react'

interface DeskResearchDetailClientProps {
  product: Product
  settings?: Settings
}

export function DeskResearchDetailClient({ product: initialProduct, settings }: DeskResearchDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [product, setProduct] = useState(initialProduct)

  const exchangeRate = settings?.exchangeRates?.USD_TO_LKR || 305

  async function handleDelete() {
    if (!confirm(`Delete research product "${product.name}"?`)) return
    startTransition(async () => {
      try {
        await deleteProduct(product._id)
        toast.success('Product deleted')
        router.push('/desk-research')
      } catch {
        toast.error('Failed to delete product')
      }
    })
  }

  async function handleStatusChange(newStatus: string) {
    setProduct(prev => ({ ...prev, status: newStatus as Product['status'] }))
    try {
      await updateProduct(product._id, { status: newStatus as Product['status'] })
      toast.success(`Status updated to ${newStatus}`)
    } catch {
      setProduct(initialProduct)
      toast.error('Failed to update status')
    }
  }

  // Margin calculation
  const landedLkr = product.landedCost || (product.chinaCost * 1.4 * exchangeRate)
  const sellLkr = product.sellingPrice || 0
  const marginPct = sellLkr > 0 ? Math.round(((sellLkr - landedLkr) / sellLkr) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/desk-research"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to Desk Research</span>
        </Link>

        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs gap-1.5">
          <RiDeleteBinLine className="size-4" />
          <span>Delete Item</span>
        </Button>
      </div>

      {/* Main Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 text-[11px] font-semibold">
                <RiSearchEyeLine className="size-3.5 mr-1" />
                Desk Research
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
              <StatusBadge status={product.status} variant="pill" />

            </div>

            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          </div>

          {/* Sourcing Link Action */}
          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:shadow-md transition-all shrink-0"
            >
              <span>Open 1688 / Alibaba Listing</span>
              <RiExternalLinkLine className="size-4" />
            </a>
          )}
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">FOB China Cost</span>
            <p className="text-base font-bold text-foreground mt-0.5">${product.chinaCost?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Est. Landed Cost</span>
            <p className="text-base font-bold text-foreground mt-0.5">{formatCurrency(landedLkr, 'LKR')}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Target Sell Price</span>
            <p className="text-base font-bold text-foreground mt-0.5">{sellLkr > 0 ? formatCurrency(sellLkr, 'LKR') : 'Not Set'}</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Est. Gross Margin</span>
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{marginPct}%</p>
          </div>
        </div>
      </div>

      {/* 1. Founder Research Highlights & Field Observations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiSparklingLine className="size-5 text-indigo-600" />
            Founder Research Findings & Field Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-foreground">
          {product.researchHighlights ? (
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 whitespace-pre-line font-medium">
              {product.researchHighlights}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No research highlights recorded yet.</p>
          )}

          {product.notes && product.notes !== product.researchHighlights && (
            <div className="pt-2 text-xs text-muted-foreground whitespace-pre-line">
              <span className="font-semibold text-foreground">Additional Sourcing Notes:</span>
              <p className="mt-1">{product.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Multi-Provider Overseas Sourcing Comparison Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiBuildingLine className="size-5 text-indigo-600" />
              <span>Overseas Sourcing Matrix (1688 / Alibaba / Taobao)</span>
            </div>
            {product.overseasProviders && product.overseasProviders.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.overseasProviders.length} Provider Offers
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {product.overseasProviders && product.overseasProviders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Supplier Store</th>
                    <th className="py-2.5 px-3">FOB Price</th>
                    <th className="py-2.5 px-3">MOQ</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {product.overseasProviders.map((prov, idx) => (
                    <tr key={idx} className={prov.isPreferred ? 'bg-primary/5 font-semibold' : ''}>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px]">
                          {prov.platform}
                        </Badge>
                        {prov.isPreferred && (
                          <span className="ml-1 text-[10px] text-emerald-600 font-bold">★ Preferred</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">{prov.storeName || 'Direct Supplier'}</td>
                      <td className="py-3 px-3 font-bold text-foreground">${prov.fobPriceUsd.toFixed(2)}</td>
                      <td className="py-3 px-3">{prov.moq} units</td>
                      <td className="py-3 px-3 text-right">
                        {prov.storeUrl ? (
                          <a
                            href={prov.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <span>Open Store</span>
                            <RiExternalLinkLine className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">No multi-provider offers recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Social Proof & Audience Comment Sentiment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiVideoLine className="size-5 text-rose-600" />
            Social Proof & Audience Comment Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {product.socialProofs && product.socialProofs.length > 0 ? (
            <div className="space-y-3">
              {product.socialProofs.map((soc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 text-[10px] font-bold">
                        {soc.platform}
                      </Badge>
                      {soc.likesCount !== undefined && (
                        <span className="text-xs font-semibold text-foreground">{soc.likesCount.toLocaleString()} engagement</span>
                      )}
                    </div>

                    {soc.postUrl && (
                      <a href={soc.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                        <span>View Post</span>
                        <RiExternalLinkLine className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {soc.commentFeedbackSummary && (
                    <div className="text-xs text-foreground bg-background p-3 rounded-lg border border-border/70">
                      <span className="font-semibold text-muted-foreground block mb-0.5">Audience Comment Feedback & Complaints Summary:</span>
                      <p className="whitespace-pre-line">{soc.commentFeedbackSummary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">No social proof links or comment feedback recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Local Sri Lanka Market Benchmark */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RiStore2Line className="size-5 text-amber-600" />
            Local Sri Lanka Sellers & Benchmark Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {product.localCompetitors && product.localCompetitors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.localCompetitors.map((comp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {comp.platform}
                    </Badge>
                    <span className="text-xs font-bold text-foreground">{formatCurrency(comp.sellingPriceLkr, 'LKR')}</span>
                  </div>

                  <p className="text-xs font-semibold text-foreground truncate">{comp.storeName || 'Local Seller'}</p>

                  {comp.productUrl && (
                    <a href={comp.productUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium">
                      <span>View Store Listing</span>
                      <RiExternalLinkLine className="size-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">No local Sri Lanka sellers recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* 5. Unit Economics & Landed Cost Waterfall */}
      <UnitEconomicsBreakdown
        chinaCostUsd={product.chinaCost}
        shippingPerUnitUsd={product.shippingPerUnit}
        customsPerUnitUsd={product.customsPerUnit}
        landedCostLkr={product.landedCost}
        exchangeRate={exchangeRate}
      />

      {/* 6. What-If Product Economics Simulator */}
      <WhatIfCalculator
        initialFobPriceUsd={product.chinaCost || 3.5}
        initialQuantity={product.moq || 100}
        initialSellingPriceLkr={product.sellingPrice || 4490}
        exchangeRate={exchangeRate}
      />
    </div>
  )
}
