'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { APP_VERSION } from '@/lib/version'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-primary-600 dark:bg-gray-800 text-white shadow-lg border-b border-primary-700 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎵</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
              Ignite Chords
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="/"
              className="px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Home
            </a>
            <a
              href="/songs"
              className="px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Songs
            </a>
            <a
              href="/admin"
              className="px-3 py-2 rounded-lg text-yellow-300/90 hover:text-yellow-100 hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Admin
            </a>
            <div className="h-6 w-px bg-white/20"></div>
            <ThemeToggle />
            <div className="text-xs text-white/60 font-mono">v{APP_VERSION}</div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a
              href="/"
              className="block px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/songs"
              className="block px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Songs
            </a>
            <a
              href="/admin"
              className="block px-3 py-2 rounded-lg text-yellow-300/90 hover:text-yellow-100 hover:bg-white/10 transition-all duration-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </a>
            <div className="pt-2 border-t border-white/20">
              <div className="px-3 py-2 text-xs text-white/60 font-mono">Version {APP_VERSION}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}