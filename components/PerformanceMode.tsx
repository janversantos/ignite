'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Settings, Minus, Plus, List, HelpCircle } from 'lucide-react'
import { chordProgressionToNumbers } from '@/utils/numberSystem'
import { transposeChordProgression, getAllKeys } from '@/utils/chordTransposer'

interface Song {
  id: string
  title: string
  artist?: string
  sections?: Array<{
    id: string
    name: string
    order: number
    chords: string
    snippet?: string
    notes?: string
  }>
  worshipLeaders?: Array<{
    name: string
    preferredKey: string
  }>
}

interface PerformanceModeProps {
  songs: Array<{
    song: Song
    key: string
    serviceSongId: string
  }>
  onClose: () => void
}

type FontSize = 'small' | 'medium' | 'large'

export function PerformanceMode({ songs, onClose }: PerformanceModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showJumpMenu, setShowJumpMenu] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showNumbers, setShowNumbers] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [currentKeys, setCurrentKeys] = useState<Record<number, string>>(
    songs.reduce((acc, song, idx) => ({ ...acc, [idx]: song.key }), {})
  )
  const [autoFontSizePx, setAutoFontSizePx] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentSong = songs[currentIndex]
  const currentKey = currentKeys[currentIndex] || currentSong.key

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return
      }

      // Navigation
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'Escape') {
        if (showJumpMenu || showHelp || showSettings) {
          setShowJumpMenu(false)
          setShowHelp(false)
          setShowSettings(false)
        } else {
          onClose()
        }
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault()
        setShowJumpMenu(!showJumpMenu)
      } else if (e.key === '?' || e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setShowHelp(!showHelp)
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1
        if (index < songs.length) {
          e.preventDefault()
          jumpToSong(index)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, songs.length, showJumpMenu, showHelp, showSettings])

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const goToNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const jumpToSong = (index: number) => {
    setCurrentIndex(index)
    setShowJumpMenu(false)
  }

  const getSemitonesDifference = (fromKey: string, toKey: string) => {
    const keys = getAllKeys()
    const steps = keys.indexOf(toKey as any) - keys.indexOf(fromKey as any)
    return steps > 6 ? steps - 12 : steps < -6 ? steps + 12 : steps
  }

  const changeKey = (newKey: string) => {
    setCurrentKeys(prev => ({ ...prev, [currentIndex]: newKey }))
  }

  const getChordProgression = (song: Song, key: string) => {
    if (!song.sections || song.sections.length === 0) return []

    const originalKey = songs[currentIndex].key
    const steps = getSemitonesDifference(originalKey, key)

    return song.sections
      .filter(section => section.chords && section.chords.trim())
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        section: section.name,
        chords: steps === 0 ? section.chords : transposeChordProgression(section.chords, steps),
        snippet: section.snippet,
        notes: section.notes
      }))
  }

  const chordProgression = getChordProgression(currentSong.song, currentKey)

  // Auto-fit font scaling for compact mode
  useEffect(() => {
    if (!compactMode || !containerRef.current) {
      setAutoFontSizePx(null)
      return
    }

    const calculateOptimalFontSize = () => {
      const viewportHeight = window.innerHeight
      const headerHeight = 60
      const footerHeight = 80
      const verticalPadding = 48 // p-6 top and bottom
      const titleSectionHeight = 160 // title + artist + worship leaders

      const availableHeight = viewportHeight - headerHeight - footerHeight - verticalPadding - titleSectionHeight

      const sectionCount = chordProgression.length
      if (sectionCount === 0) {
        setAutoFontSizePx(null)
        return
      }

      // Calculate space needed for sections (excluding text content)
      const sectionSpacing = 12 // space-y-3 between sections
      const sectionPadding = 32 // p-4 per section
      const sectionTitleHeight = 24 // section name
      const lineSpacing = 8 // space-y-2 between lines

      // Count lines per section
      let linesPerSection = 1 // chords line
      if (showNumbers) linesPerSection += 1 // numbers line
      if (showLyrics) linesPerSection += 1 // lyrics
      if (showNotes) linesPerSection += 1 // notes

      // Total fixed height for all sections
      const totalSectionOverhead = sectionCount * (sectionPadding + sectionTitleHeight) + (sectionCount - 1) * sectionSpacing
      const totalLineSpacing = sectionCount * ((linesPerSection - 1) * lineSpacing)

      // Remaining height for text content
      const remainingHeight = availableHeight - totalSectionOverhead - totalLineSpacing

      // Total lines across all sections
      const totalLines = sectionCount * linesPerSection

      // Height per line
      const heightPerLine = remainingHeight / totalLines

      // Font size calculation (accounting for line-height of 1.5)
      const lineHeightRatio = 1.5
      const fontSize = Math.floor(heightPerLine / lineHeightRatio)

      // Clamp between 14px and 48px for readability
      const clampedFontSize = Math.max(14, Math.min(48, fontSize))
      setAutoFontSizePx(clampedFontSize)
    }

    calculateOptimalFontSize()
    window.addEventListener('resize', calculateOptimalFontSize)
    return () => window.removeEventListener('resize', calculateOptimalFontSize)
  }, [compactMode, currentIndex, chordProgression.length, showLyrics, showNotes, showNumbers])

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xl md:text-2xl'
      case 'medium': return 'text-2xl md:text-3xl'
      case 'large': return 'text-3xl md:text-4xl'
    }
  }

  const getNumberSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-base md:text-lg'
      case 'medium': return 'text-lg md:text-xl'
      case 'large': return 'text-xl md:text-2xl'
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg">
            Song {currentIndex + 1}/{songs.length}
          </span>
          <div className="flex gap-1">
            {songs.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Key Selector */}
          <select
            value={currentKey}
            onChange={(e) => changeKey(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            {getAllKeys().map((key) => (
              <option key={key} value={key}>
                Key: {key}
              </option>
            ))}
          </select>

          {/* Jump Button */}
          <button
            onClick={() => setShowJumpMenu(!showJumpMenu)}
            className={`p-2 rounded-lg transition-colors ${
              showJumpMenu ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Jump to song (J)"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg transition-colors ${
              showHelp ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            title="Exit (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-4xl mx-auto">
          {/* Song Title */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {currentSong.song.title}
            </h1>
            {currentSong.song.artist && (
              <p className="text-xl text-gray-400">{currentSong.song.artist}</p>
            )}

            {/* Worship Leader Info */}
            {currentSong.song.worshipLeaders && currentSong.song.worshipLeaders.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentSong.song.worshipLeaders.map((wl, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeKey(wl.preferredKey)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      currentKey === wl.preferredKey
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {wl.name}: {wl.preferredKey}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chord Sections */}
          <div className={compactMode ? 'space-y-3' : 'space-y-6'}>
            {chordProgression.length > 0 ? (
              chordProgression.map((section, idx) => {
                const nashville = chordProgressionToNumbers(section.chords, currentKey)
                return (
                  <div key={idx} className={`bg-gray-900 rounded-lg border border-gray-800 ${compactMode ? 'p-4' : 'p-6'}`}>
                    <h3 className={`text-primary-400 font-bold mb-3 ${compactMode ? 'text-base' : 'text-xl'}`}>
                      {section.section}
                    </h3>
                    <div className="space-y-2">
                      <p
                        className={`text-white font-mono leading-relaxed ${compactMode && autoFontSizePx ? '' : getFontSizeClass()}`}
                        style={compactMode && autoFontSizePx ? { fontSize: `${autoFontSizePx}px` } : undefined}
                      >
                        {section.chords}
                      </p>
                      {showNumbers && (
                        <p
                          className={`text-primary-500 font-mono ${compactMode && autoFontSizePx ? '' : getNumberSizeClass()}`}
                          style={compactMode && autoFontSizePx ? { fontSize: `${Math.floor(autoFontSizePx * 0.75)}px` } : undefined}
                        >
                          {nashville}
                        </p>
                      )}
                      {showLyrics && section.snippet && (
                        <p className="text-gray-300 mt-3 text-base leading-relaxed whitespace-pre-line">
                          {section.snippet}
                        </p>
                      )}
                      {showNotes && section.notes && (
                        <p className="text-yellow-400 mt-2 text-sm italic">
                          📌 {section.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No chords available for this song</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Jump Menu */}
        {showJumpMenu && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl w-80 max-w-[90vw] z-20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <List className="w-4 h-4" />
              Jump to Song
            </h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {songs.map((songData, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToSong(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === currentIndex
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{songData.song.title}</p>
                      <p className="text-xs opacity-75">Key: {songData.key}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3">Press 1-9 or click to jump</p>
          </div>
        )}

        {/* Help Overlay */}
        {showHelp && (
          <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl w-80 max-w-[90vw] z-20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Song</span>
                <code className="bg-gray-800 px-2 py-1 rounded text-gray-200">→ / Space / PgDn</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Previous Song</span>
                <code className="bg-gray-800 px-2 py-1 rounded text-gray-200">← / Bksp / PgUp</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jump to Song</span>
                <code className="bg-gray-800 px-2 py-1 rounded text-gray-200">J / 1-9</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Help</span>
                <code className="bg-gray-800 px-2 py-1 rounded text-gray-200">H / ?</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Exit</span>
                <code className="bg-gray-800 px-2 py-1 rounded text-gray-200">ESC</code>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs mb-2">🎹 Foot Pedal Support</p>
              <p className="text-gray-500 text-xs">PageUp/PageDown keys work with Bluetooth foot pedals (AirTurn, etc.)</p>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl w-64 z-10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </h3>

            {/* Toggles */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Compact Mode</span>
              </label>
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showLyrics}
                  onChange={(e) => setShowLyrics(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show Lyrics</span>
              </label>
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showNumbers}
                  onChange={(e) => setShowNumbers(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Nashville Numbers</span>
              </label>
              <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showNotes}
                  onChange={(e) => setShowNotes(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show Notes</span>
              </label>
            </div>

            {/* Font Size */}
            <div className="border-t border-gray-700 pt-3">
              <p className="text-gray-400 text-xs mb-2">Font Size</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize('small')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
                    fontSize === 'small' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
                    fontSize === 'medium' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-colors ${
                    fontSize === 'large' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  L
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-gray-400 text-sm text-center">
            <p className="hidden sm:block">Use arrow keys or swipe to navigate</p>
            <p className="sm:hidden">Swipe to navigate</p>
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === songs.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
