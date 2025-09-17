'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Theme, ThemeContextType } from '@/types/theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  value: ThemeContextType
}

export function ThemeProvider({ children, value }: ThemeProviderProps) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
