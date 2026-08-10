'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  RiAddLine,
  RiSearchEyeLine,
  RiCommandLine,
  RiFlashlightLine,
} from '@remixicon/react'
import { QuickCaptureDialog } from '@/components/products/QuickCaptureDialog'
import { useCommandCenter } from '@/hooks/useCommandCenter'
import { cn } from '@/lib/utils'

export function DashboardHero() {
  const [captureOpen, setCaptureOpen] = useState(false)
  const { open: openCommand } = useCommandCenter()

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-5">
      <div className="space-y-1">
        <span className="eyebrow">Sourcing Command Center</span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Find the next product worth importing.
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Track opportunities, supplier intelligence, and Sri Lanka market signals from discovery to bulk order.
        </p>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={() => setCaptureOpen(true)}
          className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90"
        >
          <RiAddLine className="size-4" />
          <span>Capture Product</span>
        </Button>

        <Link
          href="/canton-fair"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
        >
          <RiFlashlightLine className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Fair Mode</span>
        </Link>

        <Link
          href="/research"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
        >
          <RiSearchEyeLine className="size-4 text-muted-foreground" />
          <span>Research</span>
        </Link>

        <Button
          size="sm"
          variant="ghost"
          onClick={openCommand}
          className="gap-1 text-muted-foreground hover:text-foreground font-mono text-xs hidden sm:inline-flex"
        >
          <RiCommandLine className="size-3.5" />
          <span>⌘K</span>
        </Button>
      </div>

      <QuickCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  )
}
