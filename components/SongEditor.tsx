'use client'

import { useState, useEffect } from 'react'
import { Save, X, RotateCw, Download, Upload, Music, Hash, User, Tag, ChevronUp, ChevronDown } from 'lucide-react'
import { transposeChordProgression, getAllKeys } from '@/utils/chordTransposer'
import { NashvilleConverter } from '@/lib/nashvilleConverter'

interface SongSection {
  id: string
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'pre-chorus'
  label: string
  content: string
  chords: string
}

interface SongData {
  id?: string
  title: string
  originalKey: string
  currentKey: string
  worshipLeader: string
  category: string
  songType: string
  language: string
  tempo?: number
  timeSignature?: string
  sections: SongSection[]
  notes?: string
}

interface SongEditorProps {
  song?: SongData
  isOpen: boolean
  onClose: () => void
  onSave: (songData: SongData) => void
}

const sectionTypes = [
  { value: 'intro', label: 'Intro', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'verse', label: 'Verse', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'pre-chorus', label: 'Pre-Chorus', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'chorus', label: 'Chorus', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'bridge', label: 'Bridge', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'outro', label: 'Outro', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
]

// Generate a proper UUID-like string for new sections
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function SongEditor({ song, isOpen, onClose, onSave }: SongEditorProps) {
  const [songData, setSongData] = useState<SongData>({
    title: '',
    originalKey: 'C',
    currentKey: 'C',
    worshipLeader: '',
    category: 'Worship',
    songType: 'Slow',
    language: 'English',
    tempo: 120,
    timeSignature: '4/4',
    sections: [],
    notes: ''
  })

  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importMode, setImportMode] = useState<'url' | 'manual'>('url')
  const [manualChordContent, setManualChordContent] = useState('')

  const keys = getAllKeys()

  useEffect(() => {
    if (song) {
      setSongData(song)
    }
  }, [song])

  const addSection = (type: SongSection['type']) => {
    const newSection: SongSection = {
      id: generateUUID(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${songData.sections.filter(s => s.type === type).length + 1}`,
      content: '',
      chords: ''
    }
    setSongData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (id: string, field: keyof SongSection, value: string) => {
    setSongData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }))
  }

  const removeSection = (id: string) => {
    setSongData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }))
  }

  const moveSectionUp = (index: number) => {
    if (index === 0) return
    setSongData(prev => {
      const newSections = [...prev.sections]
      ;[newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]]
      return { ...prev, sections: newSections }
    })
  }

  const moveSectionDown = (index: number) => {
    if (index === songData.sections.length - 1) return
    setSongData(prev => {
      const newSections = [...prev.sections]
      ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
      return { ...prev, sections: newSections }
    })
  }

  const transposeSong = (newKey: string) => {
    const steps = keys.indexOf(newKey as any) - keys.indexOf(songData.currentKey as any)
    const adjustedSteps = steps > 6 ? steps - 12 : steps < -6 ? steps + 12 : steps

    if (adjustedSteps === 0) return

    setSongData(prev => ({
      ...prev,
      currentKey: newKey,
      sections: prev.sections.map(section => ({
        ...section,
        chords: transposeChordProgression(section.chords, adjustedSteps)
      }))
    }))
  }

  const handleSave = () => {
    console.log('SongEditor handleSave called with data:', {
      title: songData.title,
      sectionsCount: songData.sections.length,
      sections: songData.sections.map(s => ({
        id: s.id,
        type: s.type,
        label: s.label,
        chordsLength: s.chords?.length || 0,
        contentLength: s.content?.length || 0
      }))
    })
    onSave(songData)
    onClose()
  }

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) return

    try {
      setImporting(true)
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(importUrl)}`)
      const data = await response.json()

      if (data.success) {
        let importedSections: SongSection[] = []

        // Handle structured sections
        if (data.sections?.length > 0) {
          importedSections = data.sections.map((section: any, index: number) => ({
            id: generateUUID(),
            type: section.type === 'chorus' ? 'chorus' :
                  section.type === 'bridge' ? 'bridge' :
                  section.type === 'intro' ? 'intro' :
                  section.type === 'outro' ? 'outro' : 'verse',
            label: section.label,
            content: section.content,
            chords: section.chords.join(' - ') || section.content
          }))
        }
        // Handle raw chord data when no sections are found
        else if (data.chords?.length > 0) {
          importedSections = [{
            id: generateUUID(),
            type: 'verse',
            label: 'Imported Chords',
            content: '',
            chords: data.chords.join(' - ')
          }]
        }

        if (importedSections.length > 0) {
          // Update key if detected
          const detectedKey = data.key || songData.originalKey

          setSongData(prev => ({
            ...prev,
            originalKey: detectedKey,
            currentKey: detectedKey,
            sections: [...prev.sections, ...importedSections]
          }))

          setShowImportDialog(false)
          setImportUrl('')
          alert(`Successfully imported ${importedSections.length} section(s)!`)
        } else {
          alert('Could not extract chord information from this URL. Try the manual import option instead.')
        }
      } else {
        alert('Could not extract chord information from this URL. Try the manual import option instead.')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import from URL. Try the manual import option instead.')
    } finally {
      setImporting(false)
    }
  }

  const handleManualImport = () => {
    if (!manualChordContent.trim()) return

    try {
      setImporting(true)

      // Parse manual chord content
      const lines = manualChordContent.split('\n')
      const sections: SongSection[] = []
      let currentSection: any = null
      let sectionContent: string[] = []

      for (const line of lines) {
        const trimmedLine = line.trim()

        // Check if this line is a section header
        const bracketMatch = trimmedLine.match(/^\[(.+)\]$/)
        const isSectionKeyword = trimmedLine.includes('Verse') ||
                                trimmedLine.includes('Chorus') ||
                                trimmedLine.includes('Bridge') ||
                                trimmedLine.includes('Intro')

        if (bracketMatch || isSectionKeyword) {
          // Save previous section
          if (currentSection && sectionContent.length > 0) {
            sections.push({
              id: generateUUID(),
              type: currentSection.toLowerCase().includes('chorus') ? 'chorus' :
                    currentSection.toLowerCase().includes('bridge') ? 'bridge' :
                    currentSection.toLowerCase().includes('intro') ? 'intro' : 'verse',
              label: currentSection,
              content: sectionContent.join('\n'),
              chords: sectionContent.join(' ')
            })
          }

          currentSection = bracketMatch ? bracketMatch[1] : trimmedLine
          sectionContent = []
        } else if (trimmedLine && currentSection) {
          sectionContent.push(trimmedLine)
        } else if (trimmedLine && !currentSection) {
          // No section yet, create a default one
          if (!currentSection) {
            currentSection = 'Verse 1'
          }
          sectionContent.push(trimmedLine)
        }
      }

      // Add the last section
      if (currentSection && sectionContent.length > 0) {
        sections.push({
          id: generateUUID(),
          type: currentSection.toLowerCase().includes('chorus') ? 'chorus' :
                currentSection.toLowerCase().includes('bridge') ? 'bridge' :
                currentSection.toLowerCase().includes('intro') ? 'intro' : 'verse',
          label: currentSection,
          content: sectionContent.join('\n'),
          chords: sectionContent.join(' ')
        })
      }

      // Keep Nashville numbers as-is for later conversion in song view
      console.log('Imported sections with original notation preserved')

      if (sections.length > 0) {
        setSongData(prev => ({
          ...prev,
          sections: [...prev.sections, ...sections]
        }))

        setShowImportDialog(false)
        setManualChordContent('')
        alert(`Successfully imported ${sections.length} sections!`)
      } else {
        alert('Could not parse the chord content. Please check the format.')
      }
    } catch (error) {
      console.error('Manual import error:', error)
      alert('Failed to parse chord content. Please check the format.')
    } finally {
      setImporting(false)
    }
  }

  const getSectionTypeColor = (type: string) => {
    return sectionTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {song ? 'Edit Song' : 'New Song'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced chord chart editor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import from URL
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Song Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={songData.title}
                    onChange={(e) => setSongData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                    placeholder="Enter song title..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Key
                    </label>
                    <select
                      value={songData.originalKey}
                      onChange={(e) => setSongData(prev => ({ ...prev, originalKey: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {keys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Key
                    </label>
                    <select
                      value={songData.currentKey}
                      onChange={(e) => transposeSong(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {keys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Worship Leader
                  </label>
                  <input
                    type="text"
                    value={songData.worshipLeader}
                    onChange={(e) => setSongData(prev => ({ ...prev, worshipLeader: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                    placeholder="Enter worship leader..."
                  />
                </div>
              </div>

              {/* Musical Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={songData.category}
                      onChange={(e) => setSongData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Worship">Worship</option>
                      <option value="Praise">Praise</option>
                      <option value="Contemporary">Contemporary</option>
                      <option value="Traditional">Traditional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Song Type
                    </label>
                    <select
                      value={songData.songType}
                      onChange={(e) => setSongData(prev => ({ ...prev, songType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Slow">Slow</option>
                      <option value="Fast">Fast</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={songData.language}
                      onChange={(e) => setSongData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="English">English</option>
                      <option value="Tagalog">Tagalog</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tempo (BPM)
                    </label>
                    <input
                      type="number"
                      value={songData.tempo || ''}
                      onChange={(e) => setSongData(prev => ({ ...prev, tempo: parseInt(e.target.value) || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Signature
                    </label>
                    <select
                      value={songData.timeSignature || '4/4'}
                      onChange={(e) => setSongData(prev => ({ ...prev, timeSignature: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="4/4">4/4</option>
                      <option value="3/4">3/4</option>
                      <option value="6/8">6/8</option>
                      <option value="2/4">2/4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={songData.notes || ''}
                    onChange={(e) => setSongData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                    rows={3}
                    placeholder="Add any notes about this song..."
                  />
                </div>
              </div>
            </div>

            {/* Add Section Buttons */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Song Sections</h3>
              <div className="flex flex-wrap gap-2">
                {sectionTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => addSection(type.value as SongSection['type'])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${type.color} border`}
                  >
                    + Add {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Sections */}
            <div className="space-y-6">
              {songData.sections.map((section, index) => (
                <div key={section.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSectionTypeColor(section.type)}`}>
                        {section.type}
                      </span>
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => updateSection(section.id, 'label', e.target.value)}
                        className="text-lg font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSectionDown(index)}
                        disabled={index === songData.sections.length - 1}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chords <span className="text-xs text-gray-500">(Use | for bar lines)</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id={`chords-${section.id}`}
                          value={section.chords}
                          onChange={(e) => updateSection(section.id, 'chords', e.target.value)}
                          className="w-full px-3 py-2 pr-20 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                          rows={4}
                          placeholder="G  G/B  C  |  Em  G/B  C"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`chords-${section.id}`) as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const value = textarea.value
                              const newValue = value.substring(0, start) + '\n' + value.substring(end)
                              updateSection(section.id, 'chords', newValue)
                              setTimeout(() => {
                                textarea.focus()
                                textarea.selectionStart = textarea.selectionEnd = start + 1
                              }, 0)
                            }
                          }}
                          className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded font-medium transition-colors"
                          title="Add new line"
                        >
                          + Line
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lyrics / Structure
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                        rows={4}
                        placeholder="Enter lyrics or structure notes..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {songData.sections.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sections added yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start building your song by adding sections like verses, chorus, and bridge.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {songData.sections.length} section{songData.sections.length !== 1 ? 's' : ''} • Key of {songData.currentKey}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Song
              </button>
            </div>
          </div>
        </div>

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Import Chord Chart
              </h3>

              {/* Import Mode Tabs */}
              <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg mb-6">
                <button
                  onClick={() => setImportMode('url')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    importMode === 'url'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  From URL
                </button>
                <button
                  onClick={() => setImportMode('manual')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    importMode === 'manual'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  Paste Chords
                </button>
              </div>

              <div className="space-y-4">
                {importMode === 'url' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ultimate Guitar URL
                      </label>
                      <input
                        type="url"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="https://tabs.ultimate-guitar.com/tab/..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Note: URL import may not work with all pages. Try the manual import if URL import fails.
                    </p>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Paste Chord Chart Content
                      </label>
                      <textarea
                        value={manualChordContent}
                        onChange={(e) => setManualChordContent(e.target.value)}
                        placeholder={`Example format:

[Verse 1]
G D Em C
Amazing grace how sweet the sound
G D Em C
That saved a wretch like me

[Chorus]
Am F C G
How precious did that grace appear
Am F C G
The hour I first believed`}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Copy chord content from Ultimate Guitar or any chord site. Use [Section Name] for sections like [Verse 1], [Chorus], etc.
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowImportDialog(false)
                    setImportUrl('')
                    setManualChordContent('')
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={importMode === 'url' ? handleImportFromUrl : handleManualImport}
                  disabled={
                    importing ||
                    (importMode === 'url' && !importUrl.trim()) ||
                    (importMode === 'manual' && !manualChordContent.trim())
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {importing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}