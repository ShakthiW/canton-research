'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploaderPlaceholder } from '@/components/quick-capture/ImageUploaderPlaceholder'
import { SourcingTermsSelector } from '@/components/quick-capture/SourcingTermsSelector'
import { createDeskResearchProduct } from '@/lib/actions/desk-research'
import { toast } from 'sonner'
import {
  RiSearchEyeLine,
  RiBuildingLine,
  RiVideoLine,
  RiStore2Line,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiLoader4Line,
  RiSparklingLine,
} from '@remixicon/react'

const CATEGORIES = [
  'Electronics', 'Home', 'Kitchen', 'Beauty', 'Automotive',
  'Travel', 'Fitness', 'Pets', 'Office', 'Lifestyle', 'Gifts', 'Other',
]

interface ProviderOfferInput {
  platform: '1688' | 'Alibaba' | 'Taobao' | 'Made-in-China' | 'Other'
  storeName: string
  storeUrl: string
  fobPriceUsd: string
  fobPriceCny: string
  moq: string
  isPreferred: boolean
}

interface SocialProofInput {
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Douyin' | 'Other'
  postUrl: string
  viewsCount: string
  likesCount: string
  commentsCount: string
  commentFeedbackSummary: string
}

interface LocalCompetitorInput {
  platform: 'Daraz' | 'Instagram Shop' | 'Facebook Page' | 'Direct Website' | 'Retail Shop'
  storeName: string
  productUrl: string
  sellingPriceLkr: string
  observations: string
}

export function DeskResearchForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 1. Basic Product Info
  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    primarySourceUrl: '',
    sellingPriceLkr: '',
    unitWeightKg: '',
    imageUrls: [] as string[],
    researchHighlights: '',
    notes: '',
  })
  const [observationImages, setObservationImages] = useState<string[]>([])

  // 2. Sourcing Terms
  const [sourcingTerms, setSourcingTerms] = useState({
    leadTimeDays: undefined as number | undefined,
    samplesAvailable: 'Not Discussed' as 'Free' | 'Paid' | 'No' | 'Not Discussed',
    sampleCost: undefined as number | undefined,
    customizationOptions: [] as string[],
    paymentTerms: '',
  })

  // 3. Multi-Provider Offers
  const [providers, setProviders] = useState<ProviderOfferInput[]>([
    { platform: '1688', storeName: '', storeUrl: '', fobPriceUsd: '', fobPriceCny: '', moq: '', isPreferred: true }
  ])

  // 4. Social Proof Links & Comments
  const [socialProofs, setSocialProofs] = useState<SocialProofInput[]>([
    { platform: 'TikTok', postUrl: '', viewsCount: '', likesCount: '', commentsCount: '', commentFeedbackSummary: '' }
  ])

  // 5. Local Sri Lanka Competitors
  const [localCompetitors, setLocalCompetitors] = useState<LocalCompetitorInput[]>([
    { platform: 'Daraz', storeName: '', productUrl: '', sellingPriceLkr: '', observations: '' }
  ])

  function updateForm(field: string, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  // Provider Helpers
  function addProvider() {
    setProviders(prev => [...prev, { platform: '1688', storeName: '', storeUrl: '', fobPriceUsd: '', fobPriceCny: '', moq: '', isPreferred: false }])
  }
  function updateProvider(idx: number, field: keyof ProviderOfferInput, val: unknown) {
    setProviders(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }
  function removeProvider(idx: number) {
    setProviders(prev => prev.filter((_, i) => i !== idx))
  }

  // Social Proof Helpers
  function addSocialProof() {
    setSocialProofs(prev => [...prev, { platform: 'TikTok', postUrl: '', viewsCount: '', likesCount: '', commentsCount: '', commentFeedbackSummary: '' }])
  }
  function updateSocialProof(idx: number, field: keyof SocialProofInput, val: unknown) {
    setSocialProofs(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }
  function removeSocialProof(idx: number) {
    setSocialProofs(prev => prev.filter((_, i) => i !== idx))
  }

  // Local Competitor Helpers
  function addLocalCompetitor() {
    setLocalCompetitors(prev => [...prev, { platform: 'Daraz', storeName: '', productUrl: '', sellingPriceLkr: '', observations: '' }])
  }
  function updateLocalCompetitor(idx: number, field: keyof LocalCompetitorInput, val: unknown) {
    setLocalCompetitors(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }
  function removeLocalCompetitor(idx: number) {
    setLocalCompetitors(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSave(redirectToNew = false) {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }

    startTransition(async () => {
      try {
        const res = await createDeskResearchProduct({
          name: form.name.trim(),
          category: form.category,
          sourceUrl: form.primarySourceUrl,
          sellingPriceLkr: form.sellingPriceLkr ? parseFloat(form.sellingPriceLkr) : 0,
          unitWeightKg: form.unitWeightKg ? parseFloat(form.unitWeightKg) : 0.45,
          imageUrls: Array.from(new Set([...form.imageUrls, ...observationImages])),
          researchHighlights: observationImages.length > 0
            ? [form.researchHighlights, ...observationImages.map(img => `![Observation Image](${img})`)].filter(Boolean).join('\n\n')
            : form.researchHighlights,
          notes: form.notes,
          leadTimeDays: sourcingTerms.leadTimeDays,
          samplesAvailable: sourcingTerms.samplesAvailable,
          sampleCost: sourcingTerms.sampleCost,
          customizationOptions: sourcingTerms.customizationOptions,
          paymentTerms: sourcingTerms.paymentTerms,
          providers: providers.map(p => ({
            platform: p.platform,
            storeName: p.storeName,
            storeUrl: p.storeUrl,
            fobPriceUsd: p.fobPriceUsd ? parseFloat(p.fobPriceUsd) : 0,
            fobPriceCny: p.fobPriceCny ? parseFloat(p.fobPriceCny) : undefined,
            moq: p.moq ? parseInt(p.moq) : 100,
            isPreferred: p.isPreferred,
          })),
          socialProofs: socialProofs.map(s => ({
            platform: s.platform,
            postUrl: s.postUrl,
            viewsCount: s.viewsCount ? parseInt(s.viewsCount) : undefined,
            likesCount: s.likesCount ? parseInt(s.likesCount) : undefined,
            commentsCount: s.commentsCount ? parseInt(s.commentsCount) : undefined,
            commentFeedbackSummary: s.commentFeedbackSummary,
          })),
          localCompetitors: localCompetitors.map(c => ({
            platform: c.platform,
            storeName: c.storeName,
            productUrl: c.productUrl,
            sellingPriceLkr: c.sellingPriceLkr ? parseFloat(c.sellingPriceLkr) : 0,
            observations: c.observations,
          })),
        })

        if (res.success) {
          toast.success(`Desk Research item "${form.name}" saved!`)
          if (redirectToNew) {
            setForm({
              name: '',
              category: form.category,
              primarySourceUrl: '',
              sellingPriceLkr: '',
              unitWeightKg: '',
              imageUrls: [],
              researchHighlights: '',
              notes: '',
            })
            setObservationImages([])
            setProviders([{ platform: '1688', storeName: '', storeUrl: '', fobPriceUsd: '', fobPriceCny: '', moq: '', isPreferred: true }])
            setSocialProofs([{ platform: 'TikTok', postUrl: '', viewsCount: '', likesCount: '', commentsCount: '', commentFeedbackSummary: '' }])
            setLocalCompetitors([{ platform: 'Daraz', storeName: '', productUrl: '', sellingPriceLkr: '', observations: '' }])
          } else {
            router.push(`/desk-research/${res.id}`)
          }
        }
      } catch {
        toast.error('Failed to save desk research product')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <RiSearchEyeLine className="size-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Log New Desk Research Product</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manual web research entry — track 1688/Alibaba suppliers, social media comment sentiment, and local Daraz market gaps
          </p>
        </div>
      </div>

      {/* 1. Basic Product Identity */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <RiSparklingLine className="size-4" />
          <span>Product Identity & Primary Sourcing Link</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prodName" className="text-xs font-medium">
              Product Name *
            </Label>
            <Input
              id="prodName"
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              placeholder="e.g. Portable Ultrasonic Jewelry Cleaner 450ml"
              className="h-11 text-base font-semibold"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Select value={form.category} onValueChange={(v: string | null) => v && updateForm('category', v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="primaryUrl" className="text-xs font-medium">
              Primary 1688 / Alibaba Product URL
            </Label>
            <Input
              id="primaryUrl"
              value={form.primarySourceUrl}
              onChange={e => updateForm('primarySourceUrl', e.target.value)}
              placeholder="https://detail.1688.com/offer/..."
              className="h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetPrice" className="text-xs font-medium">
              Target Selling Price in Sri Lanka (LKR)
            </Label>
            <Input
              id="targetPrice"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.sellingPriceLkr}
              onChange={e => updateForm('sellingPriceLkr', e.target.value)}
              placeholder="e.g. 4500"
              className="h-10 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weight" className="text-xs font-medium">
              Unit Weight (Kg)
            </Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.unitWeightKg}
              onChange={e => updateForm('unitWeightKg', e.target.value)}
              placeholder="e.g. 0.35"
              className="h-10 text-sm font-medium"
            />
          </div>
        </div>

        <ImageUploaderPlaceholder
          label="Product Reference Photos"
          subtitle="Add photos from 1688/Alibaba listing"
          type="product"
          multiple
          images={form.imageUrls}
          onChange={imgs => updateForm('imageUrls', imgs)}
        />
      </div>

      {/* 2. Multi-Provider Overseas Suppliers Matrix */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <RiBuildingLine className="size-4" />
            <span>Overseas Supplier Offers (1688 / Alibaba / Taobao)</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addProvider} className="h-8 text-xs gap-1">
            <RiAddLine className="size-3.5" />
            <span>Add Provider</span>
          </Button>
        </div>

        <div className="space-y-3">
          {providers.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-background space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Supplier #{idx + 1}</span>
                {providers.length > 1 && (
                  <button type="button" onClick={() => removeProvider(idx)} className="text-rose-500 hover:text-rose-600">
                    <RiDeleteBinLine className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <Label className="text-[11px]">Platform</Label>
                  <Select value={p.platform} onValueChange={(val: string | null) => val && updateProvider(idx, 'platform', val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1688">1688.com</SelectItem>
                      <SelectItem value="Alibaba">Alibaba</SelectItem>
                      <SelectItem value="Taobao">Taobao</SelectItem>
                      <SelectItem value="Made-in-China">Made-in-China</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px]">Store / Supplier Name</Label>
                  <Input
                    value={p.storeName}
                    onChange={e => updateProvider(idx, 'storeName', e.target.value)}
                    placeholder="Factory Name"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">FOB Price ($ USD)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={p.fobPriceUsd}
                    onChange={e => updateProvider(idx, 'fobPriceUsd', e.target.value)}
                    placeholder="2.50"
                    className="h-9 text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">MOQ (Units)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={p.moq}
                    onChange={e => updateProvider(idx, 'moq', e.target.value)}
                    placeholder="100"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={p.storeUrl}
                  onChange={e => updateProvider(idx, 'storeUrl', e.target.value)}
                  placeholder="Direct store listing URL..."
                  className="h-8 text-xs flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Social Proof Links & Comment Sentiment Tracker */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <RiVideoLine className="size-4" />
            <span>Social Proof & Audience Comment Sentiment</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSocialProof} className="h-8 text-xs gap-1">
            <RiAddLine className="size-3.5" />
            <span>Add Social Link</span>
          </Button>
        </div>

        <div className="space-y-3">
          {socialProofs.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-background space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Social Post #{idx + 1}</span>
                {socialProofs.length > 1 && (
                  <button type="button" onClick={() => removeSocialProof(idx)} className="text-rose-500 hover:text-rose-600">
                    <RiDeleteBinLine className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2">
                  <Label className="text-[11px]">Post / Video URL</Label>
                  <Input
                    value={s.postUrl}
                    onChange={e => updateSocialProof(idx, 'postUrl', e.target.value)}
                    placeholder="https://www.tiktok.com/@user/video/..."
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">Platform</Label>
                  <Select value={s.platform} onValueChange={(val: string | null) => val && updateSocialProof(idx, 'platform', val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Douyin">Douyin</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px]">Likes / Views</Label>
                  <Input
                    value={s.likesCount}
                    onChange={e => updateSocialProof(idx, 'likesCount', e.target.value)}
                    placeholder="e.g. 45K likes"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px]">Audience Comment Feedback & Sentiment Summary</Label>
                <Textarea
                  value={s.commentFeedbackSummary}
                  onChange={e => updateSocialProof(idx, 'commentFeedbackSummary', e.target.value)}
                  placeholder="Key observations from comments: High demand asking 'where to buy in SL?', complaints about power cable length, positive feedback on cleaning power..."
                  rows={2}
                  className="resize-none text-xs rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Local Sri Lanka Competitors & Market Gap */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <RiStore2Line className="size-4" />
            <span>Local Competitors & Sri Lanka Market Benchmark</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLocalCompetitor} className="h-8 text-xs gap-1">
            <RiAddLine className="size-3.5" />
            <span>Add Local Seller</span>
          </Button>
        </div>

        <div className="space-y-3">
          {localCompetitors.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-background space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Local Listing #{idx + 1}</span>
                {localCompetitors.length > 1 && (
                  <button type="button" onClick={() => removeLocalCompetitor(idx)} className="text-rose-500 hover:text-rose-600">
                    <RiDeleteBinLine className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <Label className="text-[11px]">Platform</Label>
                  <Select value={c.platform} onValueChange={(val: string | null) => val && updateLocalCompetitor(idx, 'platform', val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daraz">Daraz.lk</SelectItem>
                      <SelectItem value="Instagram Shop">Instagram Shop</SelectItem>
                      <SelectItem value="Facebook Page">Facebook Page</SelectItem>
                      <SelectItem value="Direct Website">Direct Website</SelectItem>
                      <SelectItem value="Retail Shop">Retail Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px]">Store Name / Handle</Label>
                  <Input
                    value={c.storeName}
                    onChange={e => updateLocalCompetitor(idx, 'storeName', e.target.value)}
                    placeholder="e.g. TechLanka Store"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">Local Price (LKR)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={c.sellingPriceLkr}
                    onChange={e => updateLocalCompetitor(idx, 'sellingPriceLkr', e.target.value)}
                    placeholder="4990"
                    className="h-9 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px]">Store / Product URL</Label>
                <Input
                  value={c.productUrl}
                  onChange={e => updateLocalCompetitor(idx, 'productUrl', e.target.value)}
                  placeholder="https://www.daraz.lk/products/..."
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Founder Research Highlights & Field Observations */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-xs">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Founder Research Highlights & Field Observations
        </Label>
        <Textarea
          value={form.researchHighlights}
          onChange={e => updateForm('researchHighlights', e.target.value)}
          placeholder="Key findings: Strong problem solver, high perceived value, local sellers charging 4x markup, potential to offer customized gift packaging..."
          rows={3}
          className="resize-none text-sm rounded-xl"
        />
        <div className="pt-2 border-t border-border/50">
          <ImageUploaderPlaceholder
            label="Attach Observations & Notes Photos"
            subtitle="Photos of local store shelves, competitor ads, packaging photos"
            multiple={true}
            images={observationImages}
            onChange={imgs => setObservationImages(imgs)}
          />
        </div>
      </div>

      {/* 6. Trade & Sourcing Terms */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <SourcingTermsSelector
          leadTimeDays={sourcingTerms.leadTimeDays}
          samplesAvailable={sourcingTerms.samplesAvailable}
          sampleCost={sourcingTerms.sampleCost}
          customizationOptions={sourcingTerms.customizationOptions}
          paymentTerms={sourcingTerms.paymentTerms}
          onChange={(field: string, val: unknown) => setSourcingTerms(prev => ({ ...prev, [field]: val }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isPending}
          className="flex-1 h-12 text-sm font-semibold gap-2 rounded-xl"
        >
          {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
          <span>Save Research Product</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={isPending}
          className="flex-1 h-12 text-sm font-semibold gap-2 rounded-xl border-primary/40 text-primary"
        >
          <RiAddLine className="size-4" />
          <span>Save & Log Next Product</span>
        </Button>
      </div>
    </div>
  )
}
