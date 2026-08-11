'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploaderPlaceholder } from '@/components/quick-capture/ImageUploaderPlaceholder'
import type { DiscoverySource, InitialInterest, DiscoveryReason } from '@/types'
import { getEmbedIframeUrl } from '@/lib/utils/embed'
import { toast } from 'sonner'
import {
  RiSparklingLine,
  RiVideoLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiShoppingBag3Line,
  RiAmazonLine,
  RiYoutubeLine,
  RiGoogleLine,
  RiMapPinLine,
  RiStore2Line,
  RiUser3Line,
  RiMoreFill,
  RiFireLine,
  RiStarLine,
  RiEyeLine,
  RiBookmarkLine,
  RiCheckLine,
  RiAddLine,
  RiCloseLine,
  RiLoader4Line,
  RiArrowRightLine,
} from '@remixicon/react'
import { captureProduct } from '@/lib/actions/capture'

const DISCOVERY_SOURCES: Array<{
  id: DiscoverySource
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = [
  { id: 'TIKTOK', label: 'TikTok', icon: RiVideoLine, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900' },
  { id: 'INSTAGRAM', label: 'Instagram', icon: RiInstagramLine, color: 'text-pink-500 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900' },
  { id: 'FACEBOOK', label: 'Facebook', icon: RiFacebookCircleLine, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' },
  { id: 'ALIBABA', label: 'Alibaba / 1688', icon: RiShoppingBag3Line, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900' },
  { id: 'AMAZON', label: 'Amazon', icon: RiAmazonLine, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900' },
  { id: 'YOUTUBE', label: 'YouTube', icon: RiYoutubeLine, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900' },
  { id: 'GOOGLE', label: 'Google Search', icon: RiGoogleLine, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' },
  { id: 'CANTON_FAIR', label: 'Canton Fair', icon: RiMapPinLine, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900' },
  { id: 'PHYSICAL_STORE', label: 'Retail Store', icon: RiStore2Line, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900' },
  { id: 'FRIEND', label: 'Friend / Contact', icon: RiUser3Line, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900' },
  { id: 'OTHER', label: 'Other', icon: RiMoreFill, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800' },
]

const DISCOVERY_REASONS: Array<{ id: DiscoveryReason; label: string; emoji: string }> = [
  { id: 'VIRAL_LOOKS', label: 'Looks viral', emoji: '🔥' },
  { id: 'PROFITABLE_LOOKS', label: 'Looks profitable', emoji: '💰' },
  { id: 'NOT_SEEN_LOCALLY', label: "Haven't seen this locally", emoji: '🇱🇰' },
  { id: 'UNUSUAL_INTERESTING', label: 'Interesting / unusual', emoji: '😮' },
  { id: 'SOLVES_PROBLEM', label: 'Solves a clear problem', emoji: '💡' },
  { id: 'GOOD_GIFT', label: 'Good for gifting', emoji: '🎁' },
  { id: 'CONTENT_POTENTIAL', label: 'High content potential', emoji: '📸' },
  { id: 'PEOPLE_BUYING', label: 'People actively buying', emoji: '🛒' },
  { id: 'JUST_CURIOUS', label: 'Just curious', emoji: '🔍' },
]

const INTEREST_LEVELS: Array<{
  id: InitialInterest
  label: string
  sublabel: string
  icon: React.ComponentType<{ className?: string }>
  border: string
  text: string
  bg: string
}> = [
  { id: 'MUST_INVESTIGATE', label: 'Must investigate', sublabel: 'This could actually be something.', icon: RiFireLine, border: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500 text-white' },

  { id: 'INTERESTING', label: 'Interesting', sublabel: 'Definitely worth researching.', icon: RiStarLine, border: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500 text-white' },
  { id: 'MAYBE', label: 'Maybe', sublabel: 'Interesting, but not sure yet.', icon: RiEyeLine, border: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500 text-white' },
  { id: 'JUST_SAVING', label: 'Just saving', sublabel: "Don't want to lose this idea.", icon: RiBookmarkLine, border: 'border-slate-400 bg-slate-50/70 dark:bg-slate-900/40', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500 text-white' },
]

const CATEGORIES = [
  'Home', 'Kitchen', 'Beauty', 'Fitness', 'Electronics', 'Auto',
  'Kids', 'Pet', 'Fashion', 'Travel', 'Office', 'Outdoor', 'Tools', 'Other',
]

export function RapidCaptureForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form State
  const [rawProductName, setRawProductName] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [source, setSource] = useState<DiscoverySource>('CANTON_FAIR')
  const [sourceUrl, setSourceUrl] = useState('')
  const [reasons, setReasons] = useState<DiscoveryReason[]>(['VIRAL_LOOKS'])
  const [initialInterest, setInitialInterest] = useState<InitialInterest>('INTERESTING')
  const [category, setCategory] = useState('Electronics')
  const [discoveryNote, setDiscoveryNote] = useState('')
  const [noteImages, setNoteImages] = useState<string[]>([])

  // Bullet Point List State
  const [bulletPoints, setBulletPoints] = useState<string[]>([
    'Saw this three times today on US TikTok.',
    'High potential for Sri Lanka gift market.',
  ])
  const [newBulletInput, setNewBulletInput] = useState('')

  function handleAddBullet() {
    if (!newBulletInput.trim()) return
    setBulletPoints(prev => [...prev, newBulletInput.trim()])
    setNewBulletInput('')
  }

  function handleRemoveBullet(index: number) {
    setBulletPoints(prev => prev.filter((_, i) => i !== index))
  }

  // Optional Pricing State
  const [hasPrice, setHasPrice] = useState(false)
  const [observedPrice, setObservedPrice] = useState('')
  const [observedCurrency, setObservedCurrency] = useState<'USD' | 'CNY' | 'LKR' | 'EUR' | 'GBP' | 'OTHER'>('USD')
  const [priceContext, setPriceContext] = useState<'Retail' | 'Wholesale' | 'Alibaba' | 'Ad' | 'Marketplace' | 'Unknown'>('Wholesale')

  // Post-Capture Success State
  const [capturedItem, setCapturedItem] = useState<{ id: string; name: string; source: string } | null>(null)

  // Smart URL Auto-Detection
  function handleUrlChange(url: string) {
    setSourceUrl(url)
    const lower = url.toLowerCase()
    if (lower.includes('tiktok.com')) setSource('TIKTOK')
    else if (lower.includes('alibaba.com') || lower.includes('1688.com')) setSource('ALIBABA')
    else if (lower.includes('instagram.com')) setSource('INSTAGRAM')
    else if (lower.includes('youtube.com') || lower.includes('youtu.be')) setSource('YOUTUBE')
    else if (lower.includes('amazon.com')) setSource('AMAZON')
    else if (lower.includes('facebook.com')) setSource('FACEBOOK')
    else if (lower.includes('google.com')) setSource('GOOGLE')
  }

  function toggleReason(r: DiscoveryReason) {
    setReasons(prev => prev.includes(r) ? prev.filter(item => item !== r) : [...prev, r])
  }

  function handleSave(batchMode = false) {
    if (!rawProductName.trim()) {
      toast.error('Please enter what you found')
      return
    }

    startTransition(async () => {
      try {
        const allImages = [...images, ...noteImages]
        const bulletText = bulletPoints.length > 0
          ? bulletPoints.map(pt => `• ${pt}`).join('\n')
          : discoveryNote
        const combinedNotes = [bulletText, ...noteImages.map(img => `![Attachment](${img})`)].filter(Boolean).join('\n\n')

          const res = await captureProduct({
            rawProductName: rawProductName.trim(),
            imageUrl: allImages[0],
            images: allImages,
            source,
            sourceUrl,
            reasons,
            initialInterest,
            rawCategory: category,
            observedPrice: hasPrice && observedPrice ? {
              amount: parseFloat(observedPrice),
              currency: observedCurrency,
              context: priceContext,
            } : undefined,
            discoveryNote: combinedNotes,
          })

          if (res.success) {
            toast.success(`Product "${rawProductName}" captured!`)
            setCapturedItem({ id: res.id, name: rawProductName.trim(), source })

            if (batchMode) {
              // Keep source, category, currency context for next item
              setRawProductName('')
              setImages([])
              setNoteImages([])
              setSourceUrl('')
              setDiscoveryNote('')
              setHasPrice(false)
              setObservedPrice('')
            } else {
            router.push(`/desk-research/${res.id}`)
          }
        }
      } catch {
        toast.error('Failed to capture product')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 select-none">
      {/* Post-Capture Success Alert */}
      {capturedItem && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <RiCheckLine className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Product Saved to Radar</p>
              <h4 className="text-sm font-bold text-foreground truncate">{capturedItem.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => router.push(`/desk-research/${capturedItem.id}`)} className="text-xs h-8 gap-1">
              <span>View Dossier</span>
              <RiArrowRightLine className="size-3.5" />
            </Button>
            <Button size="sm" onClick={() => setCapturedItem(null)} className="text-xs h-8">
              <span>Dismiss</span>
            </Button>
          </div>
        </div>
      )}

      {/* Screen Title */}
      <div className="text-center space-y-1 py-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <RiSparklingLine className="size-3.5" />
          <span>Rapid Research Radar</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">What did you find?</h1>
        <p className="text-xs text-muted-foreground">Capture it now in 15 seconds. We&apos;ll research the rest later.</p>

      </div>

      {/* 1. DOMINANT IMAGE DROPZONE */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
        <ImageUploaderPlaceholder
          label="Product Photo / Screenshot"
          subtitle="Drag & drop, paste image URL, or upload photo"
          type="product"
          multiple={false}
          images={images}
          onChange={imgs => setImages(imgs)}
        />
      </div>

      {/* 2. PRODUCT NAME ("WHAT IS IT?") */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
        <Label htmlFor="rawName" className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
          What is it? *
        </Label>
        <Input
          id="rawName"
          value={rawProductName}
          onChange={e => setRawProductName(e.target.value)}
          placeholder="e.g. Portable Car Vacuum, that magnetic kitchen organizer, TikTok cleaning gadget"
          className="h-14 px-4 text-base font-semibold border-primary/30 focus-visible:ring-primary/40 rounded-xl shadow-2xs"
          autoFocus
        />
      </div>


      {/* 3. DISCOVERY SOURCE ("WHERE DID YOU FIND IT?") */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Where did you find it?
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {DISCOVERY_SOURCES.map(src => {
            const Icon = src.icon
            const isSelected = source === src.id
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSource(src.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? `${src.color} ring-2 ring-primary/40 shadow-xs font-bold`
                    : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{src.label}</span>
              </button>
            )
          })}
        </div>

        {/* Source URL with Auto Detect & Video Player Preview */}
        <div className="pt-2 space-y-2">
          <Label htmlFor="srcUrl" className="text-[11px] font-medium text-muted-foreground">
            Source Link / TikTok Embed URL (Auto-detects video player)
          </Label>
          <Input
            id="srcUrl"
            value={sourceUrl}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="Paste TikTok video link (e.g. https://www.tiktok.com/@user/video/123456...)"
            className="h-11 text-xs rounded-xl px-3.5"
          />

          {getEmbedIframeUrl(sourceUrl) && (
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <RiVideoLine className="size-4" />
                <span>Live TikTok Video Preview</span>
              </div>
              <div className="w-full max-w-xs aspect-[9/15] rounded-xl overflow-hidden border border-border bg-black mx-auto shadow-lg">
                <iframe
                  src={getEmbedIframeUrl(sourceUrl)!}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Live TikTok Video Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIKTOK EMBED CODE / VIDEO BLOCK */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3.5">
        <div className="space-y-1">
          <Label htmlFor="embedCodeInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <RiVideoLine className="size-4 text-rose-500" />
            <span>TikTok Embed Code / Video Embed Block (Optional)</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Paste raw TikTok embed HTML snippet (e.g. <code>&lt;blockquote class=&quot;tiktok-embed&quot; cite=&quot;...&quot;&gt;</code>) or video URL.
          </p>
        </div>

        <Textarea
          id="embedCodeInput"
          value={sourceUrl}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder='Paste TikTok embed code (e.g. <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@vvictorialife/video/7613343166678322463"> ... <script async src="https://www.tiktok.com/embed.js"></script>)'
          rows={3}
          className="text-xs font-mono rounded-xl resize-none"
        />

        {getEmbedIframeUrl(sourceUrl) && (
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <RiVideoLine className="size-4" />
              <span>Live TikTok Video Player Detected</span>
            </div>
            <div className="w-full max-w-xs aspect-[9/15] rounded-xl overflow-hidden border border-border bg-black mx-auto shadow-lg">
              <iframe
                src={getEmbedIframeUrl(sourceUrl)!}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Live TikTok Video Player"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. WHY DID IT CATCH YOUR ATTENTION? (MULTIPLE SELECTION CHIPS) */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Why did this catch your attention?
        </Label>
        <div className="flex flex-wrap gap-2">
          {DISCOVERY_REASONS.map(r => {
            const isSelected = reasons.includes(r.id)
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleReason(r.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. INITIAL INTEREST (4-LEVEL VISUAL SELECTOR) */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          How interesting is it?
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {INTEREST_LEVELS.map(lvl => {
            const Icon = lvl.icon
            const isSelected = initialInterest === lvl.id
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setInitialInterest(lvl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? `${lvl.border} ring-2 ring-primary/40 shadow-xs`
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? lvl.bg : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? lvl.text : 'text-foreground'}`}>{lvl.label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{lvl.sublabel}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 6. OPTIONAL PRICE SEEN */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Did you see a price? (Optional)
          </Label>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setHasPrice(true)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${hasPrice ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setHasPrice(false)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${!hasPrice ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`}
            >
              No
            </button>
          </div>
        </div>

        {hasPrice && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <Label className="text-[11px]">Observed Price</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={observedPrice}
                onChange={e => setObservedPrice(e.target.value)}
                placeholder="e.g. 19.99"
                className="h-10 text-sm font-bold mt-1"
              />
            </div>

            <div>
              <Label className="text-[11px]">Currency</Label>
              <select
                value={observedCurrency}
                onChange={e => setObservedCurrency(e.target.value as typeof observedCurrency)}
                className="w-full h-10 mt-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="LKR">LKR (Rs)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px]">Price Context</Label>
              <select
                value={priceContext}
                onChange={e => setPriceContext(e.target.value as typeof priceContext)}
                className="w-full h-10 mt-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value="Retail">Retail Ad Price</option>
                <option value="Wholesale">Wholesale Price</option>
                <option value="Alibaba">Alibaba Unit Price</option>
                <option value="Marketplace">Daraz/Amazon Price</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 7. CATEGORY CHIPS */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Category
        </Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 8. BULLET POINTS & ATTACHMENTS */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Anything worth remembering? (Optional)
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Add key observations as bullet points to structure your product notes.
          </p>
        </div>

        {/* Bullet Points Items */}
        {bulletPoints.length > 0 && (
          <div className="space-y-2">
            {bulletPoints.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/80 text-xs font-medium"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-primary font-bold text-sm select-none">•</span>
                  <span className="text-foreground truncate">{pt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBullet(idx)}
                  className="text-muted-foreground hover:text-rose-600 p-1 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Remove bullet point"
                >
                  <RiCloseLine className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Bullet Point Input Bar */}
        <div className="flex gap-2">
          <Input
            value={newBulletInput}
            onChange={e => setNewBulletInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddBullet()
              }
            }}
            placeholder="e.g. Saw this three times today on US TikTok. High potential for Sri Lanka gift market."
            className="h-10 text-xs rounded-xl flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBullet}
            className="h-10 px-3.5 text-xs font-bold gap-1 rounded-xl shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          >
            <RiAddLine className="size-4" />
            <span>Add Point</span>
          </Button>
        </div>

        {/* Attach Note / Visual Proof Photos */}
        <div className="pt-3 border-t border-border/50">
          <ImageUploaderPlaceholder
            label="Attach Note / Visual Proof Photos"
            subtitle="Snaps of price tags, local store shelves, or extra notes"
            multiple={true}
            images={noteImages}
            onChange={imgs => setNoteImages(imgs)}
          />
        </div>
      </div>

      {/* FINAL ACTION BUTTONS */}
      <div className="flex gap-3 pt-3">
        <Button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isPending}
          className="flex-1 h-12 text-sm font-bold gap-2 rounded-xl shadow-md hover:shadow-lg"
        >
          {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
          <span>Capture Product</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={isPending}
          className="flex-1 h-12 text-sm font-bold gap-2 rounded-xl border-primary/40 text-primary hover:bg-primary/5"
        >
          <RiAddLine className="size-4" />
          <span>Capture & Add Another</span>
        </Button>
      </div>
    </div>
  )
}
