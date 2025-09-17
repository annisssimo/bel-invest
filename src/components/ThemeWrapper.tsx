'use client'

import { useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useThemeManager } from '@/hooks/useThemeManager'

function ThemeContent({ children }: { children: React.ReactNode }) {
  const themeManager = useThemeManager()
  const { effectiveTheme } = themeManager

  useEffect(() => {
    const root = document.documentElement
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [effectiveTheme])

  return (
    <ThemeProvider value={themeManager}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {children}
      </div>
    </ThemeProvider>
  )
}

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeContent>{children}</ThemeContent>
}
