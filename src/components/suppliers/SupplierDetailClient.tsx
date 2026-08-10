'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Supplier } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/products/InlineEdit'
import { toast } from 'sonner'
import { updateSupplier } from '@/lib/actions/suppliers'
import {
  RiArrowLeftLine, RiMailLine, RiPhoneLine, RiWechatLine,
  RiGlobalLine, RiStore2Line, RiMapPinLine, RiCheckLine, RiCloseLine,
} from '@remixicon/react'
import { cn } from '@/lib/utils'

interface SupplierDetailClientProps {
  supplier: Supplier
}

export function SupplierDetailClient({ supplier: initialSupplier }: SupplierDetailClientProps) {
  const router = useRouter()
  const [supplier, setSupplier] = useState(initialSupplier)

  async function handleUpdate(field: string, value: string) {
    const numericFields = ['moq', 'score', 'sampleCost', 'scoreQuality', 'scorePricing', 'scoreCommunication', 'scoreMoq', 'scoreCustomization', 'scoreLeadTime', 'scoreReliability']
    const boolFields = ['customization', 'privateLabeling', 'packagingCustomization', 'sampleAvailability']
    const update: Record<string, unknown> = {}

    if (numericFields.includes(field)) update[field] = parseFloat(value) || 0
    else if (boolFields.includes(field)) update[field] = value === 'true'
    else update[field] = value

    setSupplier(prev => ({ ...prev, ...update } as Supplier))

    try {
      await updateSupplier(supplier._id, update)
    } catch {
      setSupplier(initialSupplier)
      toast.error("Couldn't save")
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20 md:pb-8">
      {/* Back */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <RiArrowLeftLine className="size-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Supplier</p>
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-border bg-card p-5 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-1">
              <InlineEdit
                value={supplier.companyName}
                onSave={v => handleUpdate('companyName', v)}
                displayClassName="text-xl font-bold"
              />
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{supplier.supplierType || 'Unknown'}</Badge>
              {supplier.categories?.map(c => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>
          {supplier.score > 0 && (
            <div className="text-center shrink-0">
              <p className={cn(
                'text-3xl font-bold',
                supplier.score >= 80 ? 'text-emerald-600' : supplier.score >= 70 ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                {supplier.score}
              </p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <InfoCard
          title="Contact Person"
          icon={<RiStore2Line className="size-4" />}
          value={supplier.contactPerson}
          onEdit={v => handleUpdate('contactPerson', v)}
        />
        <InfoCard
          title="Booth / Hall"
          icon={<RiMapPinLine className="size-4" />}
          value={`${supplier.boothNumber || '—'}${supplier.hall ? ' · ' + supplier.hall : ''}`}
          onEdit={v => handleUpdate('boothNumber', v)}
        />
        <InfoCard
          title="Email"
          icon={<RiMailLine className="size-4" />}
          value={supplier.email}
          onEdit={v => handleUpdate('email', v)}
          type="email"
        />
        <InfoCard
          title="WeChat"
          icon={<RiWechatLine className="size-4" />}
          value={supplier.wechat}
          onEdit={v => handleUpdate('wechat', v)}
        />
        <InfoCard
          title="Phone"
          icon={<RiPhoneLine className="size-4" />}
          value={supplier.phone}
          onEdit={v => handleUpdate('phone', v)}
        />
        <InfoCard
          title="Website"
          icon={<RiGlobalLine className="size-4" />}
          value={supplier.website}
          onEdit={v => handleUpdate('website', v)}
        />
      </div>

      {/* Terms */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
        <h3 className="text-sm font-semibold">Terms & Capabilities</h3>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="MOQ" value={String(supplier.moq || '—')} onEdit={v => handleUpdate('moq', v)} />
          <FieldRow label="Lead Time" value={supplier.leadTime} onEdit={v => handleUpdate('leadTime', v)} />
          <FieldRow label="Payment Terms" value={supplier.paymentTerms} onEdit={v => handleUpdate('paymentTerms', v)} />
          <FieldRow label="Sample Cost ($)" value={String(supplier.sampleCost || 0)} onEdit={v => handleUpdate('sampleCost', v)} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { key: 'customization', label: 'Customization', value: supplier.customization },
            { key: 'privateLabeling', label: 'Private Labeling', value: supplier.privateLabeling },
            { key: 'packagingCustomization', label: 'Custom Packaging', value: supplier.packagingCustomization },
            { key: 'sampleAvailability', label: 'Samples Available', value: supplier.sampleAvailability },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-2 text-sm">
              {item.value ? (
                <RiCheckLine className="size-4 text-emerald-500 shrink-0" />
              ) : (
                <RiCloseLine className="size-4 text-red-400 shrink-0" />
              )}
              <span className={item.value ? '' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">Notes</h3>
        <InlineEdit
          value={supplier.notes}
          onSave={v => handleUpdate('notes', v)}
          type="textarea"
          placeholder="Notes about this supplier..."
        />
      </div>
    </div>
  )
}

function InfoCard({ title, icon, value, onEdit }: {
  title: string
  icon: React.ReactNode
  value: string
  onEdit: (v: string) => void
  type?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {title}
      </div>
      <InlineEdit value={value} onSave={onEdit} placeholder={`Enter ${title.toLowerCase()}`} />
    </div>
  )
}

function FieldRow({ label, value, onEdit }: { label: string; value: string; onEdit: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <InlineEdit value={value} onSave={onEdit} placeholder="—" />
    </div>
  )
}
