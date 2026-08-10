'use client'

import { usePathname } from 'next/navigation'
import { RiSearchLine, RiMoonLine, RiSunLine, RiSparkling2Line } from '@remixicon/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { QuickAdd } from './QuickAdd'
import { useCommandCenter } from '@/hooks/useCommandCenter'

const ROUTE_TITLES: Record<string, { eyebrow: string; title: string }> = {
  '/dashboard': { eyebrow: 'Workspace', title: 'Dashboard' },
  '/products': { eyebrow: 'Intelligence', title: 'Products' },
  '/research': { eyebrow: 'Discovery', title: 'Research' },
  '/suppliers': { eyebrow: 'Supply Chain', title: 'Suppliers' },
  '/canton-fair': { eyebrow: 'Field Operations', title: 'Canton Fair' },
  '/shortlist': { eyebrow: 'Decision Room', title: 'Shortlist' },
  '/samples': { eyebrow: 'Evaluation', title: 'Samples' },
  '/validation': { eyebrow: 'Market Signals', title: 'Validation' },
  '/compare': { eyebrow: 'Analysis', title: 'Compare' },
  '/calculator': { eyebrow: 'Financials', title: 'Landed Cost Calculator' },
  '/settings': { eyebrow: 'System', title: 'Settings' },
}

export function TopBar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { open: openCommand } = useCommandCenter()

  // Match root or subpath
  const currentRoute = Object.keys(ROUTE_TITLES).find(r =>
    r === '/dashboard' ? pathname === '/' || pathname === '/dashboard' : pathname.startsWith(r)
  )
  const meta = currentRoute ? ROUTE_TITLES[currentRoute] : { eyebrow: 'Workspace', title: 'Canton Intel' }

  return (
    <header className="flex h-13 items-center justify-between gap-3 border-b border-border bg-background px-4 shrink-0 select-none">
      {/* Left: Breadcrumb / context */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {meta.eyebrow}
        </span>
        <span className="text-muted-foreground/40 text-xs">/</span>
        <span className="text-xs font-semibold text-foreground truncate">
          {meta.title}
        </span>
      </div>

      {/* Center: Command launcher */}
      <button
        onClick={openCommand}
        className="flex items-center gap-2.5 rounded border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-100 w-full max-w-sm"
      >
        <RiSearchLine className="size-3.5 shrink-0 text-muted-foreground/70" />
        <span className="flex-1 text-left truncate">Search products, suppliers, commands...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Right: Quick Add + Theme Toggle */}
      <div className="flex items-center gap-2">
        <QuickAdd />

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
        >
          <RiSunLine className="size-3.5 dark:hidden" />
          <RiMoonLine className="size-3.5 hidden dark:block" />
        </Button>
      </div>
    </header>
  )
}
