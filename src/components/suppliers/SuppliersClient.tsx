'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Supplier } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QuickSupplierDialog } from './QuickSupplierDialog'
import {
  RiSearchLine,
  RiAddLine,
  RiBuilding4Line,
  RiMapPinLine,
  RiWechatLine,
} from '@remixicon/react'

interface SuppliersClientProps {
  initialSuppliers: Supplier[]
  total: number
}

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return initialSuppliers
    const q = search.toLowerCase()
    return initialSuppliers.filter(
      s =>
        s.companyName.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q) ||
        s.categories?.some(c => c.toLowerCase().includes(q)) ||
        s.boothNumber?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q)
    )
  }, [initialSuppliers, search])

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <span className="eyebrow">Supply Chain Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Suppliers & Factories
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {filtered.length} verified Chinese manufacturers, trading companies, and Canton Fair contacts
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          onClick={() => setAddOpen(true)}
        >
          <RiAddLine className="size-4" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* 2. Search Toolbar */}
      <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by factory name, contact, booth #, category, city..."
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* 3. Supplier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(supplier => (
          <Link
            key={supplier._id}
            href={`/suppliers/${supplier._id}`}
            className="group rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all p-4 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded bg-muted/80 shrink-0 flex items-center justify-center border border-border/60">
                    <RiBuilding4Line className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {supplier.companyName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {supplier.contactPerson || 'Factory Contact'} · {supplier.city || 'China'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-primary shrink-0">
                  {supplier.score > 0 ? `Score ${supplier.score}` : 'New'}
                </span>
              </div>

              {/* Booth & WeChat */}
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                {supplier.boothNumber && (
                  <div className="flex items-center gap-1.5">
                    <RiMapPinLine className="size-3 shrink-0" />
                    <span>Booth {supplier.boothNumber} ({supplier.hall || 'Fair'})</span>
                  </div>
                )}
                {supplier.wechat && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <RiWechatLine className="size-3 shrink-0" />
                    <span>{supplier.wechat}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="uppercase tracking-tight font-medium">
                {supplier.supplierType || 'Manufacturer'}
              </span>
              <span className="font-mono">
                MOQ {supplier.moq ? supplier.moq.toLocaleString() : '—'}
              </span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-16 text-center border rounded-lg bg-card">
            <span className="eyebrow block">No suppliers match</span>
            <p className="text-xs text-muted-foreground mt-1">
              Add Chinese supplier contacts from the Canton Fair or online directories.
            </p>
          </div>
        )}
      </div>

      <QuickSupplierDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
