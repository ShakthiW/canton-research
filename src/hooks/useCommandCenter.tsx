'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CommandCenterContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const CommandCenterContext = createContext<CommandCenterContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
})

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])
  return (
    <CommandCenterContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CommandCenterContext.Provider>
  )
}

export function useCommandCenter() {
  return useContext(CommandCenterContext)
}
