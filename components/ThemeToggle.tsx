'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <button
        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
        aria-label="Toggle theme"
        disabled
      >
        <Moon className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}