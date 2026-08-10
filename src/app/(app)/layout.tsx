import { getSidebarCounts } from '@/lib/queries/products'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { CommandCenter } from '@/components/shell/CommandCenter'
import { MobileNav } from '@/components/shell/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const counts = await getSidebarCounts()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar counts={counts} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>

      {/* Global Command Center */}
      <CommandCenter />

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
