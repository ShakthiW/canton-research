'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addSocialProofAction } from '@/lib/actions/desk-research'
import { toast } from 'sonner'
import {
  RiCloseLine,
  RiLoader4Line,
  RiVideoLine,
  RiTiktokLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiFacebookCircleLine,
  RiGlobalLine,
  RiHeartLine,
  RiLinkM,
} from '@remixicon/react'
import type { SocialProofEntry } from '@/types'

const PLATFORMS: Array<{
  id: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Douyin' | 'Other'
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeColor: string
}> = [
  { id: 'TikTok', label: 'TikTok', icon: RiTiktokLine, activeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400 ring-2 ring-rose-500/20' },
  { id: 'Instagram', label: 'Instagram', icon: RiInstagramLine, activeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:text-pink-400 ring-2 ring-pink-500/20' },
  { id: 'YouTube', label: 'YouTube', icon: RiYoutubeLine, activeColor: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400 ring-2 ring-red-500/20' },
  { id: 'Facebook', label: 'Facebook', icon: RiFacebookCircleLine, activeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 ring-2 ring-blue-500/20' },
  { id: 'Douyin', label: 'Douyin', icon: RiGlobalLine, activeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400 ring-2 ring-purple-500/20' },
  { id: 'Other', label: 'Other', icon: RiGlobalLine, activeColor: 'bg-slate-500/10 text-foreground border-slate-500/30 ring-2 ring-primary/20' },
]

interface AddSocialProofModalProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newProof: SocialProofEntry) => void
}

export function AddSocialProofModal({ productId, isOpen, onClose, onSuccess }: AddSocialProofModalProps) {
  const [isPending, startTransition] = useTransition()
  const [platform, setPlatform] = useState<'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Douyin' | 'Other'>('TikTok')
  const [postUrl, setPostUrl] = useState('')
  const [likesCount, setLikesCount] = useState('')
  const [commentFeedbackSummary, setCommentFeedbackSummary] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!postUrl.trim()) {
      toast.error('Please enter video or post URL')
      return
    }

    startTransition(async () => {
      try {
        const res = await addSocialProofAction(productId, {
          platform,
          postUrl: postUrl.trim(),
          likesCount: likesCount ? parseInt(likesCount) : undefined,
          commentFeedbackSummary: commentFeedbackSummary.trim(),
        })
        toast.success('Social proof link added!')
        if (res.newProof) {
          onSuccess?.(res.newProof)
        }
        onClose()
        setPostUrl('')
        setLikesCount('')
        setCommentFeedbackSummary('')
      } catch {
        toast.error('Failed to add social proof')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RiVideoLine className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">Add Social Proof & Viral Link</h3>
              <p className="text-[11px] text-muted-foreground">Attach video proofs, likes count, and audience sentiment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selector Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Social Platform *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map(p => {
                const Icon = p.icon
                const isSelected = platform === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? p.activeColor
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post / Video URL */}
          <div className="space-y-1.5">
            <Label htmlFor="postUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Video / Post Link *
            </Label>
            <div className="relative">
              <RiLinkM className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="postUrl"
                value={postUrl}
                onChange={e => setPostUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@user/video/..."
                className="pl-9 h-10 text-xs font-medium rounded-xl"
                required
              />
            </div>
          </div>

          {/* Likes / Views Count */}
          <div className="space-y-1.5">
            <Label htmlFor="likes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Likes / Views / Engagement Count
            </Label>
            <div className="relative">
              <RiHeartLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="likes"
                type="number"
                value={likesCount}
                onChange={e => setLikesCount(e.target.value)}
                placeholder="e.g. 45000"
                className="pl-9 h-10 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Audience Comment Sentiment */}
          <div className="space-y-1.5">
            <Label htmlFor="comments" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Audience Feedback & Comment Notes
            </Label>
            <Textarea
              id="comments"
              value={commentFeedbackSummary}
              onChange={e => setCommentFeedbackSummary(e.target.value)}
              placeholder="Key observations from comments: High demand asking 'where to buy in SL?', positive feedback on cleaning power..."
              rows={3}
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/80">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs font-bold rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 h-10 text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
              {isPending && <RiLoader4Line className="size-4 animate-spin" />}
              <span>Add Social Link</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
