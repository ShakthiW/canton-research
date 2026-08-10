'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  RiDashboardLine, RiBox3Line, RiSearchEyeLine, RiAddLine, RiMenu2Line,
  RiUserLine, RiStarLine,
} from '@remixicon/react'
import { QuickCaptureDialog } from '@/components/products/QuickCaptureDialog'

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: RiDashboardLine },
  { label: 'Products', href: '/products', icon: RiBox3Line },
  { label: 'Research', href: '/research', icon: RiSearchEyeLine },
  { label: 'Shortlist', href: '/shortlist', icon: RiStarLine },
]

export function MobileNav() {
  const pathname = usePathname()
  const [captureOpen, setCaptureOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Centre Add button */}
          <button
            onClick={() => setCaptureOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <RiAddLine className="size-4" />
            </div>
            <span className="text-primary">Add</span>
          </button>
        </div>
      </nav>

      <QuickCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
    </>
  )
}
