'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createSupplier } from '@/lib/actions/suppliers'
import { RiLoader4Line, RiCheckLine } from '@remixicon/react'
import { useRouter } from 'next/navigation'

interface QuickSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickSupplierDialog({ open, onOpenChange }: QuickSupplierDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    boothNumber: '',
    hall: '',
    wechat: '',
    phone: '',
    email: '',
    notes: '',
  })

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.companyName.trim()) {
      toast.error('Company name required')
      return
    }
    startTransition(async () => {
      try {
        const result = await createSupplier({
          companyName: form.companyName.trim(),
          contactPerson: form.contactPerson,
          boothNumber: form.boothNumber,
          hall: form.hall,
          wechat: form.wechat,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
        })
        toast.success('Supplier saved!')
        onOpenChange(false)
        router.push(`/suppliers/${result.id}`)
      } catch {
        toast.error("Couldn't save supplier")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base">Add Supplier</DialogTitle>
          <p className="text-xs text-muted-foreground">Quick entry — fill details later</p>
        </DialogHeader>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Company name *</Label>
            <Input
              value={form.companyName}
              onChange={e => update('companyName', e.target.value)}
              placeholder="Shenzhen Example Co."
              className="h-10"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Contact</Label>
              <Input
                value={form.contactPerson}
                onChange={e => update('contactPerson', e.target.value)}
                placeholder="Wei Chen"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">WeChat</Label>
              <Input
                value={form.wechat}
                onChange={e => update('wechat', e.target.value)}
                placeholder="WeChat ID"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Booth #</Label>
              <Input
                value={form.boothNumber}
                onChange={e => update('boothNumber', e.target.value)}
                placeholder="A123"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Hall</Label>
              <Input
                value={form.hall}
                onChange={e => update('hall', e.target.value)}
                placeholder="Hall 1.1"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="First impressions, product range, quality..."
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 flex gap-2">
          <Button onClick={handleSave} disabled={isPending || !form.companyName.trim()} className="flex-1 gap-2">
            {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : <RiCheckLine className="size-4" />}
            {isPending ? 'Saving...' : 'Save Supplier'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
