'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFairZone } from '@/lib/actions/fair'
import { toast } from 'sonner'
import { RiAddLine, RiCloseLine, RiLoader4Line, RiBuilding2Line } from '@remixicon/react'
import type { FairZone } from '@/types'

interface FairZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (newZone: FairZone) => void
}

export function FairZoneModal({ isOpen, onClose, onCreated }: FairZoneModalProps) {
  const [isPending, startTransition] = useTransition()
  const [hallId, setHallId] = useState('')
  const [name, setName] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hallId.trim()) {
      toast.error('Please enter a Hall ID / Number (e.g. Hall 1.1)')
      return
    }

    startTransition(async () => {
      try {
        const res = await createFairZone({
          hallId: hallId.trim(),
          name: name.trim() || hallId.trim(),
        })

        toast.success(`Exhibition Zone "${hallId}" created!`)
        onCreated?.({
          _id: res.id,
          hallId: res.hallId,
          name: res.name,
        })

        setHallId('')
        setName('')
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create zone')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <RiBuilding2Line className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">Add Exhibition Zone</h3>
              <p className="text-[11px] text-muted-foreground">Register an exhibition hall or area at Canton Fair</p>
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
          <div className="space-y-1.5">
            <Label htmlFor="hallId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hall ID / Number *
            </Label>
            <Input
              id="hallId"
              value={hallId}
              onChange={e => setHallId(e.target.value)}
              placeholder="e.g. Hall 1.1, Hall 3.2, Zone A"
              className="h-11 text-sm font-semibold rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zoneName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Zone Description / Category (Optional)
            </Label>
            <Input
              id="zoneName"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Electronics & Smart Tech, Home Goods"
              className="h-11 text-sm font-medium rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="h-10 text-xs rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 text-xs font-bold gap-1.5 rounded-xl">
              {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiAddLine className="size-4" />}
              <span>Create Zone</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
