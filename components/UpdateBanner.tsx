'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

export function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    // Get current version from localStorage
    const currentVersion = localStorage.getItem('app_version')

    // Check for updates every 30 seconds
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/api/version?t=' + Date.now())
        const data = await response.json()

        if (currentVersion && currentVersion !== data.version) {
          setShowBanner(true)
        } else if (!currentVersion) {
          // First time - store the version
          localStorage.setItem('app_version', data.version)
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    checkForUpdates()
    const interval = setInterval(checkForUpdates, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleReload = () => {
    setIsReloading(true)
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    window.location.reload()
  }

  const handleDismiss = async () => {
    setShowBanner(false)
    // Update the stored version to stop showing banner
    try {
      const response = await fetch('/api/version?t=' + Date.now())
      const data = await response.json()
      localStorage.setItem('app_version', data.version)
    } catch (error) {
      console.error('Failed to update version:', error)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <RefreshCw className={`w-5 h-5 flex-shrink-0 ${isReloading ? 'animate-spin' : ''}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm md:text-base">New version available!</p>
              <p className="text-xs md:text-sm text-blue-100 mt-0.5">Tap reload to get the latest features</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isReloading ? 'Reloading...' : 'Reload'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
