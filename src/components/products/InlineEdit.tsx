'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InlineEditProps {
  value: string | number
  onSave: (value: string) => Promise<void> | void
  type?: 'text' | 'number' | 'textarea'
  placeholder?: string
  className?: string
  displayClassName?: string
  inputClassName?: string
  formatDisplay?: (value: string | number) => ReactNode
  validate?: (value: string) => string | null
  prefix?: string
  suffix?: string
}

export function InlineEdit({
  value,
  onSave,
  type = 'text',
  placeholder = 'Click to edit',
  className,
  displayClassName,
  inputClassName,
  formatDisplay,
  validate,
  prefix,
  suffix,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? ''))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  // Sync external value changes
  useEffect(() => {
    if (!editing) {
      const timer = setTimeout(() => setDraft(String(value ?? '')), 0)
      return () => clearTimeout(timer)
    }
  }, [value, editing])


  function startEdit() {
    setDraft(String(value ?? ''))
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (type !== 'textarea') {
        inputRef.current.select()
      }
    }
  }, [editing, type])

  async function save() {
    if (saving) return
    const trimmed = draft.trim()

    if (validate) {
      const error = validate(trimmed)
      if (error) {
        toast.error(error)
        return
      }
    }

    if (trimmed === String(value ?? '')) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch {
      toast.error("Couldn't save. Your changes are still here. Retry.")
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(String(value ?? ''))
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') {
      cancel()
    }
  }

  if (editing) {
    const sharedProps = {
      ref: inputRef as React.Ref<never>,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: save,
      disabled: saving,
      className: cn(
        'w-full rounded border border-ring bg-background px-2 py-1 text-sm outline-none ring-2 ring-ring/20',
        'disabled:opacity-50',
        inputClassName
      ),
    }

    return (
      <div className={cn('relative', className)}>
        {type === 'textarea' ? (
          <textarea {...sharedProps} rows={3} />
        ) : (
          <div className="flex items-center gap-1">
            {prefix && <span className="text-sm text-muted-foreground shrink-0">{prefix}</span>}
            <input {...sharedProps} type={type} />
            {suffix && <span className="text-sm text-muted-foreground shrink-0">{suffix}</span>}
          </div>
        )}
      </div>
    )
  }

  const displayValue = formatDisplay ? formatDisplay(value) : (value || placeholder)
  const isBlock = type === 'textarea'
  const Component = isBlock ? 'div' : 'span'

  return (
    <Component
      onClick={startEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && startEdit()}
      aria-label={`Edit ${placeholder}`}
      className={cn(
        'inline-edit-field cursor-text min-w-[4ch]',
        isBlock ? 'block w-full' : 'inline-block',
        !value && 'text-muted-foreground italic',
        displayClassName,
        className
      )}
    >
      {prefix && value ? <span className="text-muted-foreground">{prefix}</span> : null}
      {displayValue}
      {suffix && value ? <span className="text-muted-foreground">{suffix}</span> : null}
    </Component>
  )


}
