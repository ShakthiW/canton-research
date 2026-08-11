'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product, Settings, ProductStatus, SocialProofEntry, OverseasProviderOffer, LocalCompetitorListing } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge, ALL_STATUSES } from '@/components/products/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { UnitEconomicsBreakdown } from '@/components/intelligence/unit-economics-breakdown'
import { WhatIfCalculator } from '@/components/intelligence/what-if-calculator'
import { deleteProduct } from '@/lib/actions/products'
import {
  updateDeskResearchProductAction,
  deleteOverseasProviderAction,
  deleteSocialProofAction,
  deleteLocalCompetitorAction,
  convertToCantonProductAction,
} from '@/lib/actions/desk-research'
import { formatCurrency } from '@/lib/utils/currency'
import { getEmbedIframeUrl } from '@/lib/utils/embed'
import { FormattedNotes } from '@/components/common/FormattedNotes'
import { AddProviderModal } from './AddProviderModal'
import { AddSocialProofModal } from './AddSocialProofModal'
import { AddLocalCompetitorModal } from './AddLocalCompetitorModal'
import { EditDeskResearchModal } from './EditDeskResearchModal'
import { toast } from 'sonner'
import {
  RiArrowLeftLine,
  RiSearchEyeLine,
  RiExternalLinkLine,
  RiBuildingLine,
  RiVideoLine,
  RiStore2Line,
  RiDeleteBinLine,
  RiSparklingLine,
  RiPlayCircleLine,
  RiAddLine,
  RiEditLine,
  RiExchangeDollarLine,
  RiCalculatorLine,
} from '@remixicon/react'

interface DeskResearchDetailClientProps {
  product: Product
  settings?: Settings
}

export function DeskResearchDetailClient({ product: initialProduct, settings }: DeskResearchDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [product, setProduct] = useState(initialProduct)

  useEffect(() => {
    setProduct(initialProduct)
  }, [initialProduct])

  function handleAddSocialSuccess(newProof: SocialProofEntry) {
    setProduct(prev => ({
      ...prev,
      socialProofs: [...(prev.socialProofs || []), newProof],
    }))
    startTransition(() => {
      router.refresh()
    })
  }

  function handleAddProviderSuccess(newProvider: OverseasProviderOffer) {
    setProduct(prev => ({
      ...prev,
      overseasProviders: [...(prev.overseasProviders || []), newProvider],
    }))
    startTransition(() => {
      router.refresh()
    })
  }

  function handleAddLocalSuccess(newCompetitor: LocalCompetitorListing) {
    setProduct(prev => ({
      ...prev,
      localCompetitors: [...(prev.localCompetitors || []), newCompetitor],
    }))
    startTransition(() => {
      router.refresh()
    })
  }

  function handleEditSuccess(updates: Partial<Product>) {
    setProduct(prev => ({
      ...prev,
      ...updates,
    }))
    startTransition(() => {
      router.refresh()
    })
  }

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false)
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false)
  const [isAddLocalOpen, setIsAddLocalOpen] = useState(false)

  const exchangeRate = settings?.exchangeRates?.USD_TO_LKR || 305

  // Video embed detection
  const videoUrl = product.socialProofs?.[0]?.postUrl || product.discovery?.sourceUrl || product.sourceUrl || product.productUrl
  const embedIframeUrl = getEmbedIframeUrl(videoUrl)

  // Margin calculation
  const landedLkr = product.landedCost || (product.chinaCost * 1.4 * exchangeRate)
  const sellLkr = product.sellingPrice || 0
  const marginPct = sellLkr > 0 ? Math.round(((sellLkr - landedLkr) / sellLkr) * 100) : 0

  async function handleStatusChange(newStatus: ProductStatus) {
    startTransition(async () => {
      try {
        await updateDeskResearchProductAction(product._id, { status: newStatus })
        setProduct(prev => ({ ...prev, status: newStatus }))
        toast.success(`Status updated to ${newStatus}`)
        router.refresh()
      } catch {
        toast.error('Failed to update status')
      }
    })
  }

  async function handleConvertToCanton() {
    if (!confirm(`Convert "${product.name}" to a Canton Fair Sourcing Product?`)) return
    startTransition(async () => {
      try {
        await convertToCantonProductAction(product._id)
        toast.success('Product converted to Canton Sourcing Pipeline!')
        router.push(`/products/${product._id}`)
      } catch {
        toast.error('Failed to convert product')
      }
    })
  }

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

  async function handleDeleteProvider(provId: string) {
    if (!confirm('Remove this supplier offer?')) return
    startTransition(async () => {
      try {
        await deleteOverseasProviderAction(product._id, provId)
        setProduct(prev => ({
          ...prev,
          overseasProviders: prev.overseasProviders?.filter(p => p.id !== provId),
        }))
        toast.success('Supplier offer removed')
        router.refresh()
      } catch {
        toast.error('Failed to remove supplier offer')
      }
    })
  }

  async function handleDeleteSocial(socId: string) {
    if (!confirm('Remove this social proof link?')) return
    startTransition(async () => {
      try {
        await deleteSocialProofAction(product._id, socId)
        setProduct(prev => ({
          ...prev,
          socialProofs: prev.socialProofs?.filter(s => s.id !== socId),
        }))
        toast.success('Social proof link removed')
        router.refresh()
      } catch {
        toast.error('Failed to remove social link')
      }
    })
  }

  async function handleDeleteLocal(compId: string) {
    if (!confirm('Remove this local seller listing?')) return
    startTransition(async () => {
      try {
        await deleteLocalCompetitorAction(product._id, compId)
        setProduct(prev => ({
          ...prev,
          localCompetitors: prev.localCompetitors?.filter(c => c.id !== compId),
        }))
        toast.success('Local seller removed')
        router.refresh()
      } catch {
        toast.error('Failed to remove local seller')
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-24">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/desk-research"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to Desk Research Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="h-8 text-xs font-bold gap-1 rounded-xl"
          >
            <RiEditLine className="size-3.5" />
            <span>Edit Details</span>
          </Button>

          <Button
            size="sm"
            onClick={handleConvertToCanton}
            disabled={isPending}
            className="h-8 text-xs font-bold gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <RiExchangeDollarLine className="size-3.5" />
            <span>Convert to Canton Product</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs px-2.5"
            title="Delete Item"
          >
            <RiDeleteBinLine className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Header Hero Card */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 text-[11px] font-semibold">
                <RiSearchEyeLine className="size-3.5 mr-1" />
                Desk Research
              </Badge>
              <Badge variant="secondary" className="text-xs font-semibold">
                {product.category}
              </Badge>

              {/* Status Changer */}
              <Select value={product.status} onValueChange={(val: string | null) => val && handleStatusChange(val as ProductStatus)}>
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent p-0 hover:bg-muted/50 rounded-lg">
                  <StatusBadge status={product.status} variant="pill" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
          </div>

          {/* Sourcing Link Action */}
          <div className="flex items-center gap-2 shrink-0">
            {product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:shadow-md transition-all"
              >
                <span>Open Source Listing</span>
                <RiExternalLinkLine className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* Executive High-Density Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">FOB China Cost</span>
            <p className="text-base font-bold text-foreground mt-0.5">${product.chinaCost?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">Est. Landed Cost</span>
            <p className="text-base font-bold text-foreground mt-0.5">{formatCurrency(landedLkr, 'LKR')}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">Target Sell Price</span>
            <p className="text-base font-bold text-foreground mt-0.5">{sellLkr > 0 ? formatCurrency(sellLkr, 'LKR') : 'Not Set'}</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Est. Gross Margin</span>
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{marginPct}%</p>
          </div>
        </div>
      </div>

      {/* Structured Space-Efficient 4-Tab Navigation */}
      <Tabs defaultValue="media" className="space-y-4">
        <div className="sticky top-13 z-10 bg-background/95 backdrop-blur border-b border-border py-1.5">
          <TabsList className="bg-muted/60 p-1 rounded-xl h-10 w-full sm:w-auto grid grid-cols-4 sm:flex gap-1">
            <TabsTrigger value="media" className="text-xs font-bold gap-1.5 px-4 rounded-lg">
              <RiVideoLine className="size-4 text-rose-500" />
              <span>Media & Proof</span>
            </TabsTrigger>

            <TabsTrigger value="sourcing" className="text-xs font-bold gap-1.5 px-4 rounded-lg">
              <RiBuildingLine className="size-4 text-indigo-500" />
              <span>Sourcing Matrix ({product.overseasProviders?.length || 0})</span>
            </TabsTrigger>

            <TabsTrigger value="benchmark" className="text-xs font-bold gap-1.5 px-4 rounded-lg">
              <RiStore2Line className="size-4 text-amber-500" />
              <span>Sri Lanka Benchmark ({product.localCompetitors?.length || 0})</span>
            </TabsTrigger>

            <TabsTrigger value="economics" className="text-xs font-bold gap-1.5 px-4 rounded-lg">
              <RiCalculatorLine className="size-4 text-emerald-500" />
              <span>Economics & Calculator</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB 1: MEDIA & VIRAL PROOF ─── */}
        <TabsContent value="media" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Video Player Column */}
            <div className="md:col-span-5 space-y-4">
              {embedIframeUrl ? (
                <Card className="border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/40 via-background to-background overflow-hidden shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <RiVideoLine className="size-4" />
                        <span>TikTok Video Player</span>
                      </div>
                      {videoUrl && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
                        >
                          <span>Open TikTok ↗</span>
                        </a>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="w-full max-w-xs aspect-[9/15] rounded-xl overflow-hidden border-2 border-rose-200 dark:border-rose-900 shadow-xl bg-black relative">
                      <iframe
                        src={embedIframeUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="TikTok Video Player"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : videoUrl ? (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <RiPlayCircleLine className="size-4" />
                      <span>Viral Video Link</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground truncate">{videoUrl}</p>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow"
                    >
                      <span>Watch Video</span>
                      <RiExternalLinkLine className="size-3.5" />
                    </a>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/60 bg-muted/20">
                  <CardContent className="p-6 text-center space-y-2">
                    <RiVideoLine className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No viral video link added yet.</p>
                    <Button size="sm" variant="outline" onClick={() => setIsAddSocialOpen(true)} className="text-xs font-bold gap-1 rounded-xl">
                      <RiAddLine className="size-3.5" />
                      <span>Add Video Embed</span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Social Proof & Audience Feedback Column */}
            <div className="md:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <RiVideoLine className="size-4" />
                      <span>Social Proof & Audience Comment Sentiment</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setIsAddSocialOpen(true)} className="h-7 text-xs font-bold gap-1 rounded-lg">
                      <RiAddLine className="size-3.5" />
                      <span>Add Social Link</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {product.socialProofs && product.socialProofs.length > 0 ? (
                    <div className="space-y-3">
                      {product.socialProofs.map((soc, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 text-[10px] font-bold">
                                {soc.platform}
                              </Badge>
                              {soc.likesCount !== undefined && (
                                <span className="font-semibold text-foreground">{soc.likesCount.toLocaleString()} likes/views</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {soc.postUrl && (
                                <a href={soc.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                                  <span>View Post</span>
                                  <RiExternalLinkLine className="size-3" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteSocial(soc.id)}
                                className="text-muted-foreground hover:text-rose-600 p-0.5"
                                title="Delete link"
                              >
                                <RiDeleteBinLine className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {soc.commentFeedbackSummary && (
                            <div className="bg-background p-2.5 rounded-lg border border-border/70 text-foreground">
                              <span className="font-bold text-[10px] uppercase text-muted-foreground block mb-0.5">Audience Comment Feedback:</span>
                              <p className="whitespace-pre-line">{soc.commentFeedbackSummary}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-muted-foreground italic">No social proof links or audience comment feedback logged.</p>
                      <Button size="sm" variant="outline" onClick={() => setIsAddSocialOpen(true)} className="text-xs font-bold gap-1 rounded-xl">
                        <RiAddLine className="size-3.5" />
                        <span>Log First Social Link</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Width Founder Notes & Photo Attachments */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <RiSparklingLine className="size-4" />
                  <span>Founder Research Findings & Field Notes</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsEditModalOpen(true)} className="h-7 text-xs font-semibold gap-1 text-primary">
                  <RiEditLine className="size-3.5" />
                  <span>Edit Notes</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FormattedNotes
                text={product.researchHighlights || product.notes}
                additionalImages={product.images}
              />
            </CardContent>
          </Card>
        </TabsContent>


        {/* ─── TAB 2: OVERSEAS SOURCING MATRIX ─── */}
        <TabsContent value="sourcing" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <RiBuildingLine className="size-5" />
                  <span>Overseas Sourcing Matrix (1688 / Alibaba / Taobao)</span>
                </div>
                <Button size="sm" onClick={() => setIsAddProviderOpen(true)} className="h-8 text-xs font-bold gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                  <RiAddLine className="size-3.5" />
                  <span>Add Supplier Offer</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {product.overseasProviders && product.overseasProviders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Platform</th>
                        <th className="py-2.5 px-3">Supplier / Store</th>
                        <th className="py-2.5 px-3">FOB Price ($ USD)</th>
                        <th className="py-2.5 px-3">MOQ</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {product.overseasProviders.map((prov, idx) => (
                        <tr key={idx} className={prov.isPreferred ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold' : ''}>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {prov.platform}
                            </Badge>
                            {prov.isPreferred && (
                              <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">★ Preferred</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-foreground">{prov.storeName || 'Direct Supplier'}</td>
                          <td className="py-3 px-3 font-bold text-foreground">${prov.fobPriceUsd?.toFixed(2) || '0.00'}</td>
                          <td className="py-3 px-3">{prov.moq} units</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            {prov.storeUrl && (
                              <a
                                href={prov.storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                              >
                                <span>Open Store</span>
                                <RiExternalLinkLine className="size-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteProvider(prov.id)}
                              className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                              title="Delete provider"
                            >
                              <RiDeleteBinLine className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <RiBuildingLine className="size-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground italic">No overseas supplier offers logged yet.</p>
                  <Button size="sm" onClick={() => setIsAddProviderOpen(true)} className="text-xs font-bold gap-1 rounded-xl">
                    <RiAddLine className="size-3.5" />
                    <span>Add First 1688 / Alibaba Offer</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* ─── TAB 3: SRI LANKA BENCHMARK ─── */}
        <TabsContent value="benchmark" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <RiStore2Line className="size-5" />
                  <span>Local Sri Lanka Sellers & Benchmark Listings</span>
                </div>
                <Button size="sm" onClick={() => setIsAddLocalOpen(true)} className="h-8 text-xs font-bold gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                  <RiAddLine className="size-3.5" />
                  <span>Add Local Seller</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {product.localCompetitors && product.localCompetitors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {product.localCompetitors.map((comp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {comp.platform}
                        </Badge>
                        <span className="text-xs font-bold text-foreground">{formatCurrency(comp.sellingPriceLkr, 'LKR')}</span>
                      </div>

                      <p className="text-xs font-bold text-foreground truncate">{comp.storeName || 'Local Seller'}</p>

                      {comp.observations && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{comp.observations}</p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        {comp.productUrl ? (
                          <a href={comp.productUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold">
                            <span>View Store Listing</span>
                            <RiExternalLinkLine className="size-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLocal(comp.id)}
                          className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                          title="Delete seller"
                        >
                          <RiDeleteBinLine className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <RiStore2Line className="size-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground italic">No local Sri Lanka sellers logged yet.</p>
                  <Button size="sm" onClick={() => setIsAddLocalOpen(true)} className="text-xs font-bold gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                    <RiAddLine className="size-3.5" />
                    <span>Add First Daraz / Local Shop Listing</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* ─── TAB 4: ECONOMICS & SIMULATOR ─── */}
        <TabsContent value="economics" className="space-y-5">
          <UnitEconomicsBreakdown
            chinaCostUsd={product.chinaCost}
            shippingPerUnitUsd={product.shippingPerUnit}
            customsPerUnitUsd={product.customsPerUnit}
            landedCostLkr={product.landedCost}
            exchangeRate={exchangeRate}
          />

          <WhatIfCalculator
            initialFobPriceUsd={product.chinaCost || 3.5}
            initialQuantity={product.moq || 100}
            initialSellingPriceLkr={product.sellingPrice || 4490}
            exchangeRate={exchangeRate}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Dialogs */}
      <EditDeskResearchModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <AddProviderModal
        productId={product._id}
        isOpen={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
        onSuccess={handleAddProviderSuccess}
      />

      <AddSocialProofModal
        productId={product._id}
        isOpen={isAddSocialOpen}
        onClose={() => setIsAddSocialOpen(false)}
        onSuccess={handleAddSocialSuccess}
      />

      <AddLocalCompetitorModal
        productId={product._id}
        isOpen={isAddLocalOpen}
        onClose={() => setIsAddLocalOpen(false)}
        onSuccess={handleAddLocalSuccess}
      />
    </div>
  )
}
