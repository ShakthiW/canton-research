'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ResearchItem, ProductListItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createResearchItem, convertResearchToProduct } from '@/lib/actions/research'
import { formatDistanceToNow } from '@/lib/utils/time'
import { formatCurrency } from '@/lib/utils/currency'
import {
  RiSearchLine,
  RiSearchEyeLine,
  RiAddLine,
  RiTiktokLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiGoogleLine,
  RiGlobalLine,
  RiExternalLinkLine,
  RiBox3Line,
  RiCheckLine,
  RiLoader4Line,
  RiFireLine,
  RiArrowRightLine,
} from '@remixicon/react'
import Image from 'next/image'

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TikTok: RiTiktokLine,
  Instagram: RiInstagramLine,
  YouTube: RiYoutubeLine,
}

const PLATFORM_PILLS: Array<{
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = [
  { id: 'TikTok', label: 'TikTok', icon: RiTiktokLine, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900' },
  { id: 'Instagram', label: 'Instagram', icon: RiInstagramLine, color: 'text-pink-500 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900' },
  { id: 'YouTube', label: 'YouTube', icon: RiYoutubeLine, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900' },
  { id: 'Google', label: 'Google', icon: RiGoogleLine, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' },
  { id: 'Other', label: 'Other', icon: RiGlobalLine, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800' },
]

interface ResearchClientProps {
  initialItems: ResearchItem[]
  total: number
  deskResearchProducts?: ProductListItem[]
}

export function ResearchClient({ initialItems, deskResearchProducts = [] }: ResearchClientProps) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [platformFilter, setPlatformFilter] = useState('All')
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'desk' | 'signals'>('desk')

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  function handleAddSuccess(newItem: ResearchItem) {
    setItems(prev => [newItem, ...prev])
    setActiveTab('signals')
    startTransition(() => {
      router.refresh()
    })
  }

  const filteredSignals = useMemo(() => {
    let list = [...items]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q)
      )
    }
    if (platformFilter !== 'All') {
      list = list.filter(r => r.platform === platformFilter)
    }
    return list
  }, [items, search, platformFilter])

  const filteredDeskProducts = useMemo(() => {
    let list = [...deskResearchProducts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.researchHighlights?.toLowerCase().includes(q)
      )
    }
    return list
  }, [deskResearchProducts, search])

  async function handleConvert(researchId: string) {
    setConvertingId(researchId)
    startTransition(async () => {
      try {
        const result = await convertResearchToProduct(researchId)
        toast.success('Converted to tracked opportunity ✓')
        router.push(`/products/${result.productId}`)
      } catch {
        toast.error("Couldn't convert research item")
        setConvertingId(null)
      }
    })
  }

  function formatCount(n: number) {
    if (!n) return '0'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Discovery Stream</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Research &amp; Discovery Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {deskResearchProducts.length} desk research findings &amp; {items.length} viral video signals monitored
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/desk-research/new">
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs text-xs">
              <RiAddLine className="size-4" />
              <span>Log Research Product</span>
            </Button>
          </Link>

          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 font-semibold text-xs"
            onClick={() => setAddOpen(true)}
          >
            <RiFireLine className="size-4 text-rose-500" />
            <span>Log Viral Signal</span>
          </Button>
        </div>
      </div>

      {/* 2. Tabs & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-2 rounded-xl border border-border">
        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('desk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'desk'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <RiSearchEyeLine className="size-3.5" />
            <span>Desk Research Products</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
              {deskResearchProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'signals'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <RiFireLine className="size-3.5 text-rose-400" />
            <span>Viral Video Signals</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
              {items.length}
            </span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search research..."
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          {activeTab === 'signals' && (
            <Select
              value={platformFilter}
              onValueChange={(v: string | null) => {
                if (v) setPlatformFilter(v)
              }}
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['All', 'TikTok', 'Instagram', 'YouTube', 'Google', 'Reddit', 'Other'].map(p => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* TAB 1: DESK RESEARCH PRODUCTS */}
      {activeTab === 'desk' && (
        <>
          {filteredDeskProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDeskProducts.map(product => {
                const sellLkr = product.sellingPrice || 0

                return (
                  <Card key={product._id} className="hover:border-primary/40 transition-all flex flex-col justify-between group">
                    <CardContent className="p-5 space-y-4">
                      {/* Category & Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {product.category}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {product.status}
                        </Badge>
                      </div>

                      {/* Title & Image */}
                      <div className="flex gap-3">
                        {product.imageUrl && (
                          <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                            <Image width={500} height={500} src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link href={`/desk-research/${product._id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </Link>
                          {product.sourcePlatform && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">Source: {product.sourcePlatform}</p>
                          )}
                        </div>
                      </div>

                      {/* Key Highlights Snippet */}
                      {product.researchHighlights && (
                        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2.5 rounded-lg border border-border/50 italic">
                          &quot;{product.researchHighlights}&quot;
                        </p>
                      )}

                      {/* Pricing Bar */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase">FOB Cost</span>
                          <span className="font-bold text-foreground">${product.chinaCost?.toFixed(2) || '0.00'}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase">Target Price</span>
                          <span className="font-bold text-foreground">{sellLkr > 0 ? formatCurrency(sellLkr, 'LKR') : 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>

                    {/* Footer Action */}
                    <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Desk Research Item
                      </span>

                      <Link href={`/desk-research/${product._id}`} className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Dossier</span>
                        <RiArrowRightLine className="size-3.5" />
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl space-y-4">
              <div className="size-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <RiSearchEyeLine className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">No Desk Research Products Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Start logging your web research findings from 1688, Alibaba, TikTok, and Daraz.
                </p>
              </div>
              <Link href="/desk-research/new">
                <Button className="gap-2 text-xs font-semibold">
                  <RiAddLine className="size-4" />
                  <span>Log Research Product</span>
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* TAB 2: VIRAL VIDEO SIGNALS */}
      {activeTab === 'signals' && (
        <>
          {filteredSignals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSignals.map(item => {
                const PlatformIcon = PLATFORM_ICONS[item.platform] || RiSearchLine
                const isConverting = convertingId === item._id && isPending

                return (
                  <div
                    key={item._id}
                    className="rounded-lg border border-border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground px-2 py-0.5 rounded bg-muted">
                            <PlatformIcon className="size-3.5 text-primary" />
                            {item.platform}
                          </span>

                          {item.trendStatus === 'Viral' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40">
                              <RiFireLine className="size-3" /> Viral
                            </span>
                          )}

                          {item.convertedToProduct && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                              ✓ In Pipeline
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatDistanceToNow(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-foreground line-clamp-2">
                        {item.title}
                      </h3>

                      {item.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {item.views !== undefined && item.views > 0 && (
                            <span>{formatCount(item.views)} views</span>
                          )}
                          {item.likes !== undefined && item.likes > 0 && (
                            <span>{formatCount(item.likes)} likes</span>
                          )}
                        </div>

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <span>Link</span>
                            <RiExternalLinkLine className="size-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {item.platform || 'General'}
                        </span>

                        {!item.convertedToProduct ? (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleConvert(item._id)}
                            disabled={isConverting}
                            className="gap-1 font-semibold hover:border-primary hover:text-primary"
                          >
                            {isConverting ? (
                              <RiLoader4Line className="size-3 animate-spin" />
                            ) : (
                              <RiBox3Line className="size-3" />
                            )}
                            <span>Track as Product</span>
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <RiCheckLine className="size-3.5" />
                            Tracked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl space-y-4">
              <div className="size-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <RiFireLine className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">No Viral Video Signals Logged</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Log new trending video signals from TikTok, Instagram, and YouTube to expand your discovery stream.
                </p>
              </div>
              <Button onClick={() => setAddOpen(true)} className="gap-2 text-xs font-semibold">
                <RiFireLine className="size-4 text-rose-300" />
                <span>Log First Viral Signal</span>
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal Dialog for Adding Viral Signal */}
      <AddResearchDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}

function AddResearchDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newItem: ResearchItem) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [url, setUrl] = useState('')
  const [viewsCount, setViewsCount] = useState('')
  const [likesCount, setLikesCount] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    startTransition(async () => {
      try {
        const res = await createResearchItem({
          title: title.trim(),
          platform,
          url: url.trim(),
          views: viewsCount ? parseInt(viewsCount) : undefined,
          likes: likesCount ? parseInt(likesCount) : undefined,
          notes: notes.trim(),
        })
        toast.success('Viral signal logged ✓')
        if (res.item) {
          onSuccess(res.item as ResearchItem)
        }
        onOpenChange(false)
        setTitle('')
        setUrl('')
        setNotes('')
        setViewsCount('')
        setLikesCount('')
      } catch {
        toast.error('Failed to log viral signal')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <RiFireLine className="size-5 text-rose-500" />
          <span>Log Viral Video Signal</span>
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2 text-xs">
          <div>
            <Label htmlFor="sig-title" className="text-[11px] font-semibold">Title / Product Hook *</Label>
            <Input
              id="sig-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Wireless Cleaning Brush TikTok Video"
              className="h-8 text-xs mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-[11px] font-semibold">Platform</Label>
            <Select value={platform} onValueChange={(v: string | null) => v && setPlatform(v)}>
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_PILLS.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sig-url" className="text-[11px] font-semibold">Video / Post URL</Label>
            <Input
              id="sig-url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="views" className="text-[11px] font-semibold">Views Count</Label>
              <Input
                id="views"
                type="number"
                value={viewsCount}
                onChange={e => setViewsCount(e.target.value)}
                placeholder="500000"
                className="h-8 text-xs mt-1"
              />
            </div>

            <div>
              <Label htmlFor="likes" className="text-[11px] font-semibold">Likes Count</Label>
              <Input
                id="likes"
                type="number"
                value={likesCount}
                onChange={e => setLikesCount(e.target.value)}
                placeholder="40000"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sig-notes" className="text-[11px] font-semibold">Observations &amp; Comment Notes</Label>
            <Textarea
              id="sig-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Comments asking 'where to buy?', unique feature..."
              rows={2}
              className="text-xs mt-1 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-8 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1"
            >
              {isPending && <RiLoader4Line className="size-3.5 animate-spin" />}
              <span>Save Signal</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
