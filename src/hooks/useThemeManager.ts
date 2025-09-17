'use client'

import { useState, useEffect } from 'react'
import { Theme } from '@/types/theme'

const THEME_STORAGE_KEY = 'skarbnica-theme'

export function useThemeManager() {
  const [theme, setTheme] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark')
  const [isLoaded, setIsLoaded] = useState(false)

  // Determine effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save theme to localStorage and update html class when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      
      // Update html class for background color
      const html = document.documentElement
      if (effectiveTheme === 'light') {
        html.classList.add('light')
        html.classList.remove('dark')
      } else {
        html.classList.add('dark')
        html.classList.remove('light')
      }
    }
  }, [theme, effectiveTheme, isLoaded])

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return {
    theme,
    effectiveTheme,
    setTheme: updateTheme,
    isLoaded
  }
}
