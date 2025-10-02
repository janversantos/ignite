'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Settings, Minus, Plus } from 'lucide-react'
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
  const [compactMode, setCompactMode] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showNumbers, setShowNumbers] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [currentKeys, setCurrentKeys] = useState<Record<number, string>>(
    songs.reduce((acc, song, idx) => ({ ...acc, [idx]: song.key }), {})
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const currentSong = songs[currentIndex]
  const currentKey = currentKeys[currentIndex] || currentSong.key

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, songs.length])

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

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                      <p className={`text-white font-mono leading-relaxed ${getFontSizeClass()}`}>
                        {section.chords}
                      </p>
                      {showNumbers && (
                        <p className={`text-primary-500 font-mono ${getNumberSizeClass()}`}>
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
