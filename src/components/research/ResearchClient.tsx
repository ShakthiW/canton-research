'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ResearchItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createResearchItem, convertResearchToProduct } from '@/lib/actions/research'
import { formatDistanceToNow } from '@/lib/utils/time'
import {
  RiSearchLine,
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
} from '@remixicon/react'
import { cn } from '@/lib/utils'

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
}

export function ResearchClient({ initialItems }: ResearchClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [platformFilter, setPlatformFilter] = useState('All')
  const [convertingId, setConvertingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = [...initialItems]
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q)
      )
    }
    if (platformFilter !== 'All') {
      items = items.filter(r => r.platform === platformFilter)
    }
    return items
  }, [initialItems, search, platformFilter])

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
            Research & Viral Signals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {filtered.length} trending items monitored across TikTok, Instagram & YouTube
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          onClick={() => setAddOpen(true)}
        >
          <RiAddLine className="size-4" />
          <span>Log Signal</span>
        </Button>
      </div>

      {/* 2. Compact Toolbar */}
      <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter research signals..."
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <Select
          value={platformFilter}
          onValueChange={(v: string | null) => {
            if (v) setPlatformFilter(v)
          }}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
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
      </div>

      {/* 3. Research Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => {
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

                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {item.title}
                </h3>

                {item.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Engagement metrics & actions */}
              <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  {item.views > 0 && <span>👁 {formatCount(item.views)}</span>}
                  {item.likes > 0 && <span>♥ {formatCount(item.likes)}</span>}
                  {item.shares > 0 && <span>↗ {formatCount(item.shares)}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'size-7 p-0')}
                      title="Open source"
                    >
                      <RiExternalLinkLine className="size-3.5" />
                    </a>
                  )}

                  {!item.convertedToProduct ? (
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-xs gap-1 font-semibold hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleConvert(item._id)}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <RiLoader4Line className="size-3 animate-spin" />
                      ) : (
                        <RiBox3Line className="size-3.5" />
                      )}
                      <span>Convert</span>
                    </Button>
                  ) : (
                    item.productId && (
                      <Link
                        href={`/products/${item.productId}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'gap-1 text-xs text-primary')}
                      >
                        <span>View Product →</span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-16 text-center border rounded-lg bg-card">
            <span className="eyebrow block">No research signals found</span>
            <p className="text-xs text-muted-foreground mt-1">
              Log new trending video signals to expand your discovery radar.
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddResearchDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

function AddResearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    title: '',
    url: '',
    platform: 'TikTok',
    views: '',
    likes: '',
    notes: '',
  })

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.title.trim()) return
    startTransition(async () => {
      try {
        await createResearchItem({
          title: form.title,
          url: form.url,
          platform: form.platform,
          views: form.views ? parseInt(form.views) : 0,
          likes: form.likes ? parseInt(form.likes) : 0,
          notes: form.notes,
        })
        toast.success('Research item added ✓')
        onOpenChange(false)
        setForm({ title: '', url: '', platform: 'TikTok', views: '', likes: '', notes: '' })
      } catch {
        toast.error("Couldn't add research item")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-border/80 bg-gradient-to-r from-rose-50/50 via-background to-background dark:from-rose-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <RiFireLine className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Log Viral Signal</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Track trending products & viral content across platforms</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Title / What is trending? *
            </Label>
            <Input
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Hydrocolloid Acne Patches, Sunset Lamp, Oil Sprayer"
              className="h-11 text-sm font-semibold rounded-xl"
              autoFocus
            />
          </div>

          {/* Platform Selector Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Source Platform
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLATFORM_PILLS.map(p => {
                const Icon = p.icon
                const isSelected = form.platform === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update('platform', p.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all gap-1 ${
                      isSelected
                        ? `${p.color} ring-2 ring-primary/40 shadow-xs`
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-[11px]">{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* View Count & Likes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                View Count
              </Label>
              <Input
                type="number"
                value={form.views}
                onChange={e => update('views', e.target.value)}
                placeholder="e.g. 2500000"
                className="h-11 text-xs font-mono rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Likes / Engagement (Optional)
              </Label>
              <Input
                type="number"
                value={form.likes}
                onChange={e => update('likes', e.target.value)}
                placeholder="e.g. 180000"
                className="h-11 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Source Link */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Source Link / Web URL
            </Label>
            <Input
              value={form.url}
              onChange={e => update('url', e.target.value)}
              placeholder="https://www.tiktok.com/@creator/video/..."
              className="h-11 text-xs font-mono rounded-xl"
            />
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Observations & Creator Comments
            </Label>
            <Textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Key creator comments, viral hook used, why this is resonating with viewers..."
              rows={3}
              className="text-xs rounded-xl resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-4 text-xs font-bold rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 px-6 text-xs font-bold gap-2 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all"
            onClick={handleSave}
            disabled={isPending || !form.title.trim()}
          >
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
            <span>Save Signal</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
