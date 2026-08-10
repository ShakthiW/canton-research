'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  RiDashboardLine,
  RiBox3Line,
  RiUserLine,
  RiMapPinLine,
  RiSearchEyeLine,
  RiStarLine,
  RiFlaskLine,
  RiCheckboxCircleLine,
  RiCalculatorLine,
  RiScales2Line,
  RiAddLine,
  RiArrowRightLine,
  RiFlashlightLine,
} from '@remixicon/react'
import { useCommandCenter } from '@/hooks/useCommandCenter'
import { QuickCaptureDialog } from '@/components/products/QuickCaptureDialog'
import { QuickSupplierDialog } from '@/components/suppliers/QuickSupplierDialog'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: RiDashboardLine, shortcut: 'G D' },
  { label: 'Products', href: '/products', icon: RiBox3Line, shortcut: 'G P' },
  { label: 'Research', href: '/research', icon: RiSearchEyeLine, shortcut: 'G R' },
  { label: 'Suppliers', href: '/suppliers', icon: RiUserLine, shortcut: 'G S' },
  { label: 'Canton Fair', href: '/canton-fair', icon: RiMapPinLine, shortcut: 'G F' },
  { label: 'Shortlist', href: '/shortlist', icon: RiStarLine, shortcut: 'G L' },
  { label: 'Samples', href: '/samples', icon: RiFlaskLine, shortcut: 'G M' },
  { label: 'Validation', href: '/validation', icon: RiCheckboxCircleLine, shortcut: 'G V' },
  { label: 'Compare Products', href: '/compare', icon: RiScales2Line, shortcut: 'G C' },
  { label: 'Landed Cost Calculator', href: '/calculator', icon: RiCalculatorLine, shortcut: 'G K' },
]

export function CommandCenter() {
  const router = useRouter()
  const { isOpen, close, open } = useCommandCenter()
  const [quickCapture, setQuickCapture] = useState(false)
  const [quickSupplier, setQuickSupplier] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) close()
        else open()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, open, close])

  function navigate(href: string) {
    close()
    router.push(href)
  }

  return (
    <>
      <CommandDialog open={isOpen} onOpenChange={openState => { if (!openState) close(); else open(); }}>
        <CommandInput placeholder="What do you want to do? Search or type a command..." />
        <CommandList className="max-h-[380px] p-1">
          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
            No commands or results found.
          </CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                close()
                setQuickCapture(true)
              }}
              className="gap-2 text-xs"
            >
              <RiAddLine className="size-4 text-primary" />
              <span>Capture Product Opportunity</span>
              <kbd className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                C
              </kbd>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                close()
                setQuickSupplier(true)
              }}
              className="gap-2 text-xs"
            >
              <RiAddLine className="size-4 text-indigo-500" />
              <span>Add Chinese Supplier</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/canton-fair')}
              className="gap-2 text-xs"
            >
              <RiFlashlightLine className="size-4 text-emerald-500" />
              <span>Launch Canton Fair Walking Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/calculator')}
              className="gap-2 text-xs"
            >
              <RiCalculatorLine className="size-4 text-muted-foreground" />
              <span>Calculate Landed Cost & Margin</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="gap-2 text-xs"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <kbd className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted/60 px-1 py-0.5 rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <QuickCaptureDialog open={quickCapture} onOpenChange={setQuickCapture} />
      <QuickSupplierDialog open={quickSupplier} onOpenChange={setQuickSupplier} />
    </>
  )
}
