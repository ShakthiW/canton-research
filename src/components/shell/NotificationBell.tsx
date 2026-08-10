'use client'

import {
  getNotifications,
  markAllNotificationsAsRead,
  ResearchNotification,
} from '@/lib/notifications/store'
import { Button } from '@/components/ui/button'
import {
  RiCheckDoubleLine,
  RiNotification3Line,
  RiSparklingLine,
} from '@remixicon/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<ResearchNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const reload = () => {
    setNotifications(getNotifications())
  }

  useEffect(() => {
    const timer = setTimeout(reload, 0)
    window.addEventListener('canton_notification_updated', reload)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('canton_notification_updated', reload)
    }
  }, [])


  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative text-muted-foreground hover:text-foreground"
      >
        <RiNotification3Line className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-background">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-popover p-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-1.5">
              <RiSparklingLine className="size-4 text-indigo-500" />
              <span className="text-xs font-bold text-foreground">AI Intelligence Notifications</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllNotificationsAsRead()
                  reload()
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:underline"
              >
                <RiCheckDoubleLine className="size-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                No recent background research notifications.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/products/${n.productId}`}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg p-2.5 transition hover:bg-muted/70 ${
                    !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{n.productName}</span>
                    {n.score !== undefined && (
                      <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        {n.score}/100
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Research complete! Recommendation: <strong>{n.recommendation || 'VALIDATE FIRST'}</strong>
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
