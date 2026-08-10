'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  RiAddLine,
  RiBox3Line,
  RiUserLine,
  RiSearchEyeLine,
  RiMapPinLine,
  RiFlaskLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
} from '@remixicon/react'
import { QuickCaptureDialog } from '@/components/products/QuickCaptureDialog'
import { QuickSupplierDialog } from '@/components/suppliers/QuickSupplierDialog'

const INTENT_OPTIONS = [
  {
    id: 'product',
    label: 'Product Opportunity',
    desc: 'Capture a potential winner with economics & demand signals',
    icon: RiBox3Line,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
  },
  {
    id: 'supplier',
    label: 'Supplier / Factory',
    desc: 'Record Chinese manufacturer contact & booth details',
    icon: RiUserLine,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    id: 'research',
    label: 'Viral Trend Find',
    desc: 'Log a trending video or product signal from TikTok/Instagram',
    icon: RiSearchEyeLine,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40',
  },
  {
    id: 'fair',
    label: 'Canton Fair Booth Visit',
    desc: 'Rapidly record a booth walk note with price quote',
    icon: RiMapPinLine,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'sample',
    label: 'Sample Order',
    desc: 'Track physical sample dispatch and quality review',
    icon: RiFlaskLine,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
  },
  {
    id: 'validation',
    label: 'Market Validation Test',
    desc: 'Log Sri Lanka pre-order or ad test campaign results',
    icon: RiCheckboxCircleLine,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40',
  },
]

export function QuickAdd() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [supplierOpen, setSupplierOpen] = useState(false)

  function handleSelect(id: string) {
    setMenuOpen(false)
    if (id === 'product') setProductOpen(true)
    else if (id === 'supplier') setSupplierOpen(true)
    else if (id === 'research') router.push('/research')
    else if (id === 'fair') router.push('/canton-fair')
    else if (id === 'sample') router.push('/samples')
    else if (id === 'validation') router.push('/validation')
  }

  return (
    <>
      <Button
        size="xs"
        onClick={() => setMenuOpen(true)}
        className="gap-1 bg-primary text-primary-foreground font-semibold px-2.5 shadow-xs hover:bg-primary/90"
      >
        <RiAddLine className="size-3.5" />
        <span>New</span>
      </Button>

      {/* Intent-first selection modal */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="text-sm font-bold tracking-tight">Create New Entry</DialogTitle>
            <p className="text-xs text-muted-foreground">Select what you want to add to your sourcing intelligence</p>
          </DialogHeader>

          <div className="p-2 divide-y divide-border/40">
            {INTENT_OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full flex items-center gap-3 p-3 rounded text-left hover:bg-muted/60 transition-colors group"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${opt.color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <RiArrowRightLine className="size-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <QuickCaptureDialog open={productOpen} onOpenChange={setProductOpen} />
      <QuickSupplierDialog open={supplierOpen} onOpenChange={setSupplierOpen} />
    </>
  )
}
