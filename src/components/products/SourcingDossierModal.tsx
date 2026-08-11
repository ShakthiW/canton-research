'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { OpportunityScore } from './OpportunityScore'
import { toast } from 'sonner'
import {
  RiPrinterLine,
  RiFileCopyLine,
  RiCheckLine,
  RiBox3Line,
  RiBuildingLine,
  RiFireLine,
} from '@remixicon/react'

interface SourcingDossierModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  supplierInfo?: {
    companyName?: string
    boothNumber?: string
    wechatId?: string
    contactInfo?: string
  }
}

export function SourcingDossierModal({
  open,
  onOpenChange,
  product,
  supplierInfo,
}: SourcingDossierModalProps) {
  const [copied, setCopied] = useState(false)

  if (!product) return null

  const landedLkr = (product.landedCost || 0) * 310
  const sellLkr = (product.sellingPrice || 0) * 310
  const profitLkr = sellLkr - landedLkr
  const profitMarginPercent = sellLkr > 0 ? ((profitLkr / sellLkr) * 100).toFixed(1) : '0'

  function handlePrint() {
    window.print()
  }

  function handleCopyMarkdown() {
    if (!product) return
    const markdown = `
# Executive Sourcing Dossier: ${product.name}
**Category:** ${product.category} | **Status:** ${product.status}
**Opportunity Score:** ${product.score}/100

## 💰 Unit Economics & Financials
- **China FOB Cost:** $${product.chinaCost?.toFixed(2) || '0.00'}
- **Est. Landed Cost:** $${product.landedCost?.toFixed(2) || '0.00'} (~Rs. ${landedLkr.toLocaleString()})
- **Target Retail Price:** $${product.sellingPrice?.toFixed(2) || '0.00'} (~Rs. ${sellLkr.toLocaleString()})
- **Est. Profit Margin:** ${profitMarginPercent}%
- **MOQ:** ${product.moq || 'N/A'} units

## 🏢 Supplier & Canton Fair Booth
- **Supplier:** ${supplierInfo?.companyName || 'Canton Fair Sourced'}
- **Booth:** ${supplierInfo?.boothNumber || 'N/A'}
- **WeChat / Contact:** ${supplierInfo?.wechatId || supplierInfo?.contactInfo || 'N/A'}

## 📊 Market Demand Signals
- **Viral Demand:** ${product.viralStatus ? 'YES 🔥' : 'Standard'}
- **TikTok Views:** ${(product.tiktokViews || 0).toLocaleString()}
- **Competition:** ${product.competitionLevel || 'Medium'}

## 📝 Observations & Sourcing Notes
${product.notes || product.description || 'No field notes provided.'}
    `.trim()

    navigator.clipboard.writeText(markdown)
    setCopied(true)
    toast.success('Dossier summary copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden border-border shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden p-4 border-b border-border bg-muted/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
              DOSSIER PREVIEW
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Ready for Print or PDF Export
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="h-9 text-xs font-bold gap-1.5 rounded-xl"
            >
              {copied ? <RiCheckLine className="size-4 text-emerald-600" /> : <RiFileCopyLine className="size-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-9 text-xs font-bold gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md"
            >
              <RiPrinterLine className="size-4" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Dossier Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-background text-foreground" id="dossier-print-area">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-primary/30 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                  EXECUTIVE DOSSIER
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 pt-0.5">
                <Badge variant="outline" className="text-xs font-semibold">
                  {product.category}
                </Badge>
                <StatusBadge status={product.status} />
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Opportunity Score</span>
              <OpportunityScore score={product.score || 0} size="lg" />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">China Cost (FOB)</span>
              <p className="text-xl font-black font-mono text-foreground">${product.chinaCost?.toFixed(2) || '0.00'}</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Landed Cost (LKR)</span>
              <p className="text-xl font-black font-mono text-primary">Rs. {landedLkr.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground block font-mono">${product.landedCost?.toFixed(2) || '0.00'} USD</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Retail (LKR)</span>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">Rs. {sellLkr.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground block font-mono">${product.sellingPrice?.toFixed(2) || '0.00'} USD</span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net Margin</span>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{profitMarginPercent}%</p>
              <span className="text-[10px] text-muted-foreground block font-mono">+Rs. {profitLkr.toLocaleString()} / unit</span>
            </div>
          </div>

          {/* Product Image & Supplier Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Product Image & Visuals
              </span>
              <div className="relative aspect-video rounded-xl bg-muted border border-border overflow-hidden">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <RiBox3Line className="size-10 opacity-40" />
                    <span className="text-xs">No image attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier & Fair Booth Details */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <RiBuildingLine className="size-4 text-primary" />
                <span>Supplier & Fair Booth Details</span>
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Supplier Company:</span>
                  <span className="font-bold text-foreground">{supplierInfo?.companyName || 'Canton Fair Direct'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Booth Number:</span>
                  <span className="font-mono font-bold text-primary">{supplierInfo?.boothNumber || 'Recorded at Fair'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">WeChat / Phone:</span>
                  <span className="font-mono font-semibold text-foreground">{supplierInfo?.wechatId || supplierInfo?.contactInfo || 'Provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">MOQ (Min Order Qty):</span>
                  <span className="font-mono font-bold text-foreground">{product.moq || 500} units</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Source Platform:</span>
                  <span className="font-semibold text-foreground">{product.sourcePlatform || 'Canton Fair'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Intelligence & Demand Signals */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <RiFireLine className="size-4 text-rose-500" />
              <span>Market Intelligence & Demand Signals</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Viral Status</span>
                <span className="font-bold text-foreground">{product.viralStatus ? '🔥 Viral Hit' : 'Standard'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">TikTok / Video Views</span>
                <span className="font-mono font-bold text-foreground">{(product.tiktokViews || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Competition Level</span>
                <span className="font-bold text-foreground">{product.competitionLevel || 'Medium'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Growth Trend</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{product.growthTrend || 'Emerging'}</span>
              </div>
            </div>
          </div>

          {/* Field Observations & Notes */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Field Observations & Technical Notes
            </span>
            <div className="p-4 rounded-xl border border-border bg-muted/10 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {product.notes || product.description || 'No field notes logged for this product item.'}
            </div>
          </div>

          {/* Footer Watermark for Executive PDF */}
          <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Generated by Canton Fair Sourcing Intelligence System</span>
            <span>Confidential Sourcing Document</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
