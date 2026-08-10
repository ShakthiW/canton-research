'use client'

import { cn } from '@/lib/utils'
import { RiCheckLine } from '@remixicon/react'

export const CATEGORIES = [
  { id: 'Electronics', label: 'Electronics', icon: '⚡' },
  { id: 'Home', label: 'Home & Decor', icon: '🏡' },
  { id: 'Kitchen', label: 'Kitchen & Dining', icon: '🍳' },
  { id: 'Beauty', label: 'Beauty & Care', icon: '💄' },
  { id: 'Automotive', label: 'Automotive & Tools', icon: '🚗' },
  { id: 'Travel', label: 'Travel & Bags', icon: '🧳' },
  { id: 'Fitness', label: 'Sports & Fitness', icon: '⚽' },
  { id: 'Pets', label: 'Pet Supplies', icon: '🐾' },
  { id: 'Office', label: 'Office & Tech', icon: '🖥️' },
  { id: 'Lifestyle', label: 'Toys & Lifestyle', icon: '🎮' },
  { id: 'Gifts', label: 'Gifts & Novelties', icon: '🎁' },
  { id: 'Other', label: 'Other / General', icon: '📦' },
]

interface CategoryMultiSelectProps {
  selected: string[]
  onChange: (categories: string[]) => void
}

export function CategoryMultiSelect({ selected, onChange }: CategoryMultiSelectProps) {
  function toggleCategory(catId: string) {
    if (selected.includes(catId)) {
      // Don't allow empty if only one selected and it's clicked, or allow toggling
      const updated = selected.filter(c => c !== catId)
      onChange(updated.length > 0 ? updated : ['Other'])
    } else {
      onChange([...selected.filter(c => c !== 'Other'), catId])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories (Tap to Select)
        </label>
        <span className="text-xs text-primary font-medium">
          {selected.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {CATEGORIES.map(cat => {
          const isSelected = selected.includes(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                'relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98]',
                'min-h-[52px] select-none touch-manipulation',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/40'
                  : 'border-border/70 bg-card text-foreground hover:bg-accent/50 hover:border-border'
              )}
            >
              <span className="text-lg leading-none shrink-0">{cat.icon}</span>
              <span className="text-xs leading-tight flex-1 truncate">{cat.label}</span>
              {isSelected && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <RiCheckLine className="size-3.5" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
