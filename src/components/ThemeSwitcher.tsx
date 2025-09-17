'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Theme } from '@/types/theme'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Светлая', icon: Sun },
    { value: 'dark', label: 'Темная', icon: Moon },
    { value: 'system', label: 'Система', icon: Monitor },
  ]

  return (
    <div className="flex items-center bg-gray-100/80 dark:bg-gray-700/50 p-1 rounded-xl backdrop-blur-sm">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${theme === value
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
            }
          `}
          title={label}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
