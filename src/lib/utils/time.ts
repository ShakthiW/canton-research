export function formatDistanceToNow(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return 'Unknown'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)

  if (months >= 1) return `${months}mo ago`
  if (days >= 1) return `${days}d ago`
  if (hours >= 1) return `${hours}h ago`
  if (mins >= 1) return `${mins}m ago`
  return 'Just now'
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
