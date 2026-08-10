'use client'

export interface ResearchNotification {
  id: string
  productId: string
  productName: string
  type: string
  score?: number
  recommendation?: string
  completedAt: string
  read: boolean
}

const STORAGE_KEY = 'canton_research_notifications'

export function getNotifications(): ResearchNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addNotification(notification: Omit<ResearchNotification, 'id' | 'read'>): ResearchNotification {
  const list = getNotifications()
  const newItem: ResearchNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    read: false,
  }
  const updated = [newItem, ...list].slice(0, 20)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('canton_notification_updated'))
  }
  return newItem
}

export function markAllNotificationsAsRead(): void {
  const list = getNotifications().map((n) => ({ ...n, read: true }))
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('canton_notification_updated'))
  }
}
