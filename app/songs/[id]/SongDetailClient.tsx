'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Music, User, Hash, Edit2, Save, X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { SongsService } from '@/lib/songsData'
import { transposeChordProgression, getAllKeys } from '@/utils/chordTransposer'
import { chordProgressionToNumbers } from '@/utils/numberSystem'

interface SongDetailClientProps {
  id: string
}

type ViewMode = 'full' | 'compact' | 'chords'

export default function SongDetailClient({ id }: SongDetailClientProps) {
  const router = useRouter()
  const [song, setSong] = useState<any>(null)
  const [currentKey, setCurrentKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [useNumberSystem, setUseNumberSystem] = useState(false)
  const [editedSong, setEditedSong] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('full')

  const keys = getAllKeys()

  useEffect(() => {
    const songData = SongsService.getSongById(id)
    if (songData) {
      setSong(songData)
      setCurrentKey(songData.defaultKey || 'C')
    }
    setLoading(false)

    // Load saved view mode from localStorage
    const savedViewMode = localStorage.getItem('songViewMode') as ViewMode
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [id])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('songViewMode', mode)
  }

  const getSectionTypeColor = (name: string) => {
    const lowerName = name.toLowerCase()
    const colorMap: { [key: string]: string } = {
      'intro': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'verse': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'pre-chorus': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'chorus': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bridge': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'outro': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }

    for (const [key, value] of Object.entries(colorMap)) {
      if (lowerName.includes(key)) return value
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const getSemitonesDifference = (fromKey: string, toKey: string) => {
    const steps = keys.indexOf(toKey as any) - keys.indexOf(fromKey as any)
    return steps > 6 ? steps - 12 : steps < -6 ? steps + 12 : steps
  }

  const transposeSong = (newKey: string) => {
    if (!song) return

    const steps = getSemitonesDifference(currentKey, newKey)

    if (steps === 0) return

    setCurrentKey(newKey)

    // Update the song with transposed chords
    setSong((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.map((section: any) => ({
          ...section,
          chords: transposeChordProgression(section.chords, steps)
        }))
      }
    })
  }

  const formatChords = (chordLine: string) => {
    if (!chordLine) return null

    const displayChords = useNumberSystem
      ? chordProgressionToNumbers(chordLine, currentKey)
      : chordLine

    // Split by newlines first to preserve line breaks
    const lines = displayChords.split('\n').filter(line => line.trim())

    return (
      <div className="space-y-2">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap gap-2">
            {line.split(/\s+/).filter(chord => chord.trim()).map((chord, index) => (
              <span key={index} className="inline-block font-semibold text-blue-600 dark:text-blue-400">
                {chord}
              </span>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditedSong(JSON.parse(JSON.stringify(song)))
    }
    setIsEditMode(!isEditMode)
  }

  const handleSaveEdit = () => {
    // In a real app, this would save to backend/JSON file
    // For now, just update local state
    setSong(editedSong)
    setIsEditMode(false)

    // Log the JSON so user can copy to songs.json
    console.log('=== COPY THIS TO data/songs.json ===')
    console.log(JSON.stringify(editedSong, null, 2))
    console.log('====================================')

    alert('Changes applied temporarily.\n\nTo save permanently:\n1. Open browser console (F12)\n2. Copy the JSON output\n3. Update data/songs.json file')
  }

  const handleCancelEdit = () => {
    setEditedSong(null)
    setIsEditMode(false)
  }

  const updateEditedSection = (sectionId: string, field: string, value: string) => {
    setEditedSong((prev: any) => ({
      ...prev,
      sections: prev.sections.map((s: any) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }))
  }

  const addNewSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      name: 'New Section',
      order: editedSong.sections.length + 1,
      chords: '',
      snippet: '',
      notes: ''
    }
    setEditedSong((prev: any) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const removeSection = (sectionId: string) => {
    setEditedSong((prev: any) => ({
      ...prev,
      sections: prev.sections
        .filter((s: any) => s.id !== sectionId)
        .map((s: any, idx: number) => ({ ...s, order: idx + 1 }))
    }))
  }

  const moveSectionUp = (sectionId: string) => {
    setEditedSong((prev: any) => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order)
      const currentIndex = sections.findIndex(s => s.id === sectionId)

      if (currentIndex > 0) {
        // Swap with previous section
        const temp = sections[currentIndex]
        sections[currentIndex] = sections[currentIndex - 1]
        sections[currentIndex - 1] = temp

        // Update order values
        return {
          ...prev,
          sections: sections.map((s, idx) => ({ ...s, order: idx + 1 }))
        }
      }
      return prev
    })
  }

  const moveSectionDown = (sectionId: string) => {
    setEditedSong((prev: any) => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order)
      const currentIndex = sections.findIndex(s => s.id === sectionId)

      if (currentIndex < sections.length - 1) {
        // Swap with next section
        const temp = sections[currentIndex]
        sections[currentIndex] = sections[currentIndex + 1]
        sections[currentIndex + 1] = temp

        // Update order values
        return {
          ...prev,
          sections: sections.map((s, idx) => ({ ...s, order: idx + 1 }))
        }
      }
      return prev
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Loading song...</h3>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Song not found</h3>
          <button
            onClick={() => router.push('/songs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Songs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Compact Top Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{song.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {song.artist && <span className="truncate">{song.artist}</span>}
              </div>
            </div>
            {/* Key Display with Dropdown */}
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
              <select
                value={currentKey}
                onChange={(e) => transposeSong(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-sm min-h-[40px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Transpose to different key"
              >
                <option value={song.defaultKey || song.originalKey}>{song.defaultKey || song.originalKey} (Original)</option>
                {song.worshipLeaders && song.worshipLeaders.length > 0 && (
                  <optgroup label="Worship Leaders">
                    {song.worshipLeaders.map((wl: any, idx: number) => {
                      const semitones = getSemitonesDifference(song.defaultKey || song.originalKey, wl.preferredKey)
                      const semitoneLabel = semitones > 0 ? `↑${semitones}` : semitones < 0 ? `↓${Math.abs(semitones)}` : '='
                      return (
                        <option key={idx} value={wl.preferredKey}>
                          {wl.preferredKey} - {wl.name} ({semitoneLabel})
                        </option>
                      )
                    })}
                  </optgroup>
                )}
                <optgroup label="All Keys">
                  {keys.map(key => {
                    if (key === (song.defaultKey || song.originalKey) ||
                        song.worshipLeaders?.some((wl: any) => wl.preferredKey === key)) {
                      return null
                    }
                    return <option key={key} value={key}>{key}</option>
                  })}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Header (non-sticky) */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* Controls - Responsive Grid */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            {/* Edit Mode Toggle */}
            {isEditMode ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditToggle}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {/* Number System Toggle */}
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[44px]">
              <input
                type="checkbox"
                checked={useNumberSystem}
                onChange={(e) => setUseNumberSystem(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number System
              </span>
            </label>

            {/* Key Selector */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Transpose:
              </label>
              <select
                value={currentKey}
                onChange={(e) => transposeSong(e.target.value)}
                className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
              >
                {keys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle Bar - Only show when not in edit mode */}
          {!isEditMode && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewModeChange('full')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                    viewMode === 'full'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Full
                </button>
                <button
                  onClick={() => handleViewModeChange('compact')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                    viewMode === 'compact'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => handleViewModeChange('chords')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                    viewMode === 'chords'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Chords Only
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Song Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Worship Leaders Section - Moved to top */}
        {song.worshipLeaders && song.worshipLeaders.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Quick Transpose - Tap to change key:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {song.worshipLeaders.map((wl: any, idx: number) => {
                const semitones = getSemitonesDifference(song.defaultKey, wl.preferredKey);
                const semitoneLabel = semitones > 0 ? `↑${semitones}` : semitones < 0 ? `↓${Math.abs(semitones)}` : '=';
                const isActive = currentKey === wl.preferredKey;

                return (
                  <button
                    key={idx}
                    onClick={() => transposeSong(wl.preferredKey)}
                    className={`min-h-[44px] px-4 py-3 rounded-lg shadow-sm border transition-all text-left ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-400'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-400'
                    }`}
                  >
                    <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {wl.name}
                    </div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${isActive ? 'text-purple-100' : 'text-purple-600 dark:text-purple-400'}`}>
                      <Hash className="w-3 h-3" />
                      Key of {wl.preferredKey}
                      <span className={`ml-auto font-mono font-semibold ${isActive ? 'text-white' : 'text-purple-700 dark:text-purple-300'}`}>
                        {semitoneLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {song.structure && song.structure.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Song Structure:</h3>
            <p className="text-blue-800 dark:text-blue-200">{song.structure.join(' → ')}</p>
          </div>
        )}

        {(isEditMode ? editedSong : song).sections && (isEditMode ? editedSong : song).sections.length > 0 ? (
          <div className={viewMode === 'chords' ? 'space-y-3' : viewMode === 'compact' ? 'space-y-4' : 'space-y-8'}>
            {(isEditMode ? editedSong : song).sections
              .sort((a: any, b: any) => a.order - b.order)
              .map((section: any, index: number, array: any[]) => {
                // Chords Only View
                if (viewMode === 'chords' && !isEditMode) {
                  return (
                    <div key={section.id} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getSectionTypeColor(section.name)}`}>
                        {section.name}
                      </span>
                      <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold text-lg">
                        {formatChords(section.chords)}
                      </div>
                    </div>
                  )
                }

                // Compact View
                if (viewMode === 'compact' && !isEditMode) {
                  return (
                    <div key={section.id} className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSectionTypeColor(section.name)}`}>
                          {section.name}
                        </span>
                        {section.notes && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {section.notes}
                          </span>
                        )}
                      </div>
                      {section.chords && (
                        <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold mb-2 text-sm">
                          {formatChords(section.chords)}
                        </div>
                      )}
                      {section.snippet && (
                        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {section.snippet}
                        </div>
                      )}
                    </div>
                  )
                }

                // Full View (default) and Edit Mode
                return (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 relative">
                  {/* Action Buttons (Edit Mode Only) */}
                  {isEditMode && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      {/* Move Up */}
                      <button
                        onClick={() => moveSectionUp(section.id)}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition-all ${
                          index === 0
                            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveSectionDown(section.id)}
                        disabled={index === array.length - 1}
                        className={`p-2 rounded-lg transition-all ${
                          index === array.length - 1
                            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remove Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateEditedSection(section.id, 'name', e.target.value)}
                        className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSectionTypeColor(section.name)}`}>
                        {section.name}
                      </span>
                    )}
                    {isEditMode ? (
                      <input
                        type="text"
                        value={section.notes || ''}
                        onChange={(e) => updateEditedSection(section.id, 'notes', e.target.value)}
                        placeholder="Performance notes..."
                        className="flex-1 text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      />
                    ) : section.notes ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {section.notes}
                      </span>
                    ) : null}
                  </div>

                  {/* Chords */}
                  {isEditMode ? (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Chords: <span className="text-gray-500 font-normal">(Use | to group chords in one bar, press Enter for new line)</span>
                      </label>
                      <textarea
                        value={section.chords || ''}
                        onChange={(e) => updateEditedSection(section.id, 'chords', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation()
                          }
                        }}
                        placeholder="G  G/B  C  |  Em  G/B  C&#10;G  G/B  C  |  Em  D  C"
                        rows={4}
                        className="w-full font-mono px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                      />
                    </div>
                  ) : section.chords ? (
                    <div className="mb-4 font-mono bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      {formatChords(section.chords)}
                    </div>
                  ) : null}

                  {/* Snippet */}
                  {isEditMode ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Lyric Snippet:
                      </label>
                      <textarea
                        value={section.snippet || ''}
                        onChange={(e) => updateEditedSection(section.id, 'snippet', e.target.value)}
                        placeholder="First line of lyrics..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  ) : section.snippet ? (
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.snippet}
                    </div>
                  ) : null}
                </div>
                )
              })}


            {/* Add Section Button (Edit Mode Only) */}
            {isEditMode && (
              <button
                onClick={addNewSection}
                className="w-full py-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Section</span>
              </button>
            )}
          </div>
        ) : isEditMode ? (
          <div className="text-center py-12">
            <button
              onClick={addNewSection}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-all"
            >
              <Plus className="w-5 h-5" />
              Add First Section
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No chord charts available</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Chord charts for this song haven't been added yet.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}