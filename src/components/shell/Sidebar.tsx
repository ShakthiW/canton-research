'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  RiDashboardLine,
  RiBox3Line,
  RiSearchEyeLine,
  RiUserLine,
  RiMapPinLine,
  RiStarLine,
  RiFlaskLine,
  RiCheckboxCircleLine,
  RiScales2Line,
  RiCalculatorLine,
  RiSettings3Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSparkling2Line,
} from '@remixicon/react'
import { TooltipProvider } from '@/components/ui/tooltip'

interface SidebarCounts {
  products: number
  deskResearch?: number
  shortlisted: number
  suppliers: number
  samples: number
  validation: number
}

const WORKSPACE_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: RiDashboardLine, countKey: null },
  { label: 'Products', href: '/products', icon: RiBox3Line, countKey: 'products' },
  { label: 'Desk Research', href: '/desk-research', icon: RiSearchEyeLine, countKey: 'deskResearch' },
  { label: 'Suppliers', href: '/suppliers', icon: RiUserLine, countKey: 'suppliers' },
  { label: 'Canton Fair', href: '/canton-fair', icon: RiMapPinLine, countKey: null },
]

const OPERATIONS_NAV = [
  { label: 'Shortlist', href: '/shortlist', icon: RiStarLine, countKey: 'shortlisted' },
  { label: 'Samples', href: '/samples', icon: RiFlaskLine, countKey: 'samples' },
  { label: 'Validation', href: '/validation', icon: RiCheckboxCircleLine, countKey: null },
]

const TOOLS_NAV = [
  { label: 'Research Agent', href: '/research', icon: RiSearchEyeLine },
  { label: 'Compare Products', href: '/compare', icon: RiScales2Line },
  { label: 'Calculator', href: '/calculator', icon: RiCalculatorLine },
]

const SYSTEM_NAV = [
  { label: 'Settings', href: '/settings', icon: RiSettings3Line },
]

export function Sidebar({ counts }: { counts: SidebarCounts }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cpi_sidebar_collapsed')
    if (saved !== null) {
      const timer = setTimeout(() => setCollapsed(saved === 'true'), 0)
      return () => clearTimeout(timer)
    }
  }, [])


  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('cpi_sidebar_collapsed', String(next))
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delay={100}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-sidebar select-none transition-all duration-200 ease-in-out shrink-0 z-20',
          collapsed ? 'w-[56px]' : 'w-[210px]'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-4 h-13 border-b border-border shrink-0',
            collapsed && 'px-0 justify-center'
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground shrink-0 shadow-xs">
            <RiSparkling2Line className="size-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-foreground uppercase">
                Canton Intel
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Sourcing OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin px-2 space-y-4">
          <NavGroup
            title="Workspace"
            items={WORKSPACE_NAV}
            collapsed={collapsed}
            counts={counts}
            isActive={isActive}
          />

          <NavGroup
            title="Operations"
            items={OPERATIONS_NAV}
            collapsed={collapsed}
            counts={counts}
            isActive={isActive}
          />

          <NavGroup
            title="Tools"
            items={TOOLS_NAV}
            collapsed={collapsed}
            counts={counts}
            isActive={isActive}
          />

          <NavGroup
            title="System"
            items={SYSTEM_NAV}
            collapsed={collapsed}
            counts={counts}
            isActive={isActive}
          />
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={toggleCollapse}
            className={cn(
              'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? 'Expand sidebar' : undefined}
          >
            {collapsed ? (
              <RiMenuUnfoldLine className="size-4 shrink-0" />
            ) : (
              <>
                <RiMenuFoldLine className="size-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}

function NavGroup({
  title,
  items,
  collapsed,
  counts,
  isActive,
}: {
  title: string
  items: Array<{
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    countKey?: string | null
  }>
  collapsed: boolean
  counts: SidebarCounts
  isActive: (href: string) => boolean
}) {
  return (
    <div>
      {!collapsed && (
        <div className="px-2 mb-1">
          <span className="eyebrow">{title}</span>
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map(item => {
          const rawCount = item.countKey ? counts[item.countKey as keyof SidebarCounts] : null
          const count = rawCount !== undefined && rawCount !== null ? rawCount : null
          const active = isActive(item.href)
          const Icon = item.icon


          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded px-2 py-1.5 text-xs transition-colors duration-100',
                  active
                    ? 'bg-sidebar-accent text-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? `${item.label}${count !== null && count > 0 ? ` (${count})` : ''}` : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r bg-primary" />
                )}
                <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate tracking-tight">{item.label}</span>
                    {count !== null && count > 0 && (
                      <span className="tabular-nums text-[10px] font-medium text-muted-foreground px-1 py-0.2 rounded bg-muted/60">
                        {count > 999 ? '999+' : count}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
