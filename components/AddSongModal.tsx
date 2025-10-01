'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { getAllKeys } from '@/utils/chordTransposer'

interface AddSongModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSong: (song: any) => void
  worshipLeaders: string[]
  categories: string[]
}

interface ChordSection {
  section: string
  chords: string
  lyrics: string
}

export function AddSongModal({ isOpen, onClose, onAddSong, worshipLeaders, categories }: AddSongModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    key: 'C',
    worshipLeader: worshipLeaders[0] || '',
    category: 'Contemporary',
    songType: 'Slow',
    language: 'English',
    tempo: 120,
    timeSignature: '4/4',
    notes: '',
    lyrics: ''
  })
  const [chordSections, setChordSections] = useState<ChordSection[]>([
    { section: 'Verse 1', chords: '', lyrics: '' }
  ])
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const keys = getAllKeys()

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleChordSectionChange = (index: number, field: keyof ChordSection, value: string) => {
    setChordSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    )
  }

  const addChordSection = () => {
    setChordSections(prev => [
      ...prev,
      { section: 'New Section', chords: '', lyrics: '' }
    ])
  }

  const removeChordSection = (index: number) => {
    if (chordSections.length > 1) {
      setChordSections(prev => prev.filter((_, i) => i !== index))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Song title is required'
    }
    if (!formData.worshipLeader) {
      newErrors.worshipLeader = 'Please select a worship leader'
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const songData = {
      ...formData,
      chordSections: chordSections.filter(section =>
        section.section.trim() || section.chords.trim() || section.lyrics.trim()
      )
    }

    onAddSong(songData)
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      title: '',
      key: 'C',
      worshipLeader: worshipLeaders[0] || '',
      category: 'Contemporary',
      songType: 'Slow',
      language: 'English',
      tempo: 120,
      timeSignature: '4/4',
      notes: '',
      lyrics: ''
    })
    setChordSections([{ section: 'Verse 1', chords: '', lyrics: '' }])
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Song</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter song title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key
                </label>
                <select
                  value={formData.key}
                  onChange={(e) => handleInputChange('key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Worship Leader *
                </label>
                <select
                  value={formData.worshipLeader}
                  onChange={(e) => handleInputChange('worshipLeader', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.worshipLeader ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select a leader...</option>
                  {worshipLeaders.map(leader => (
                    <option key={leader} value={leader}>{leader}</option>
                  ))}
                </select>
                {errors.worshipLeader && (
                  <p className="mt-1 text-sm text-red-600">{errors.worshipLeader}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="Worship">Worship</option>
                  <option value="Praise">Praise</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Traditional">Traditional</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Song Type
                </label>
                <select
                  value={formData.songType}
                  onChange={(e) => handleInputChange('songType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Tagalog">Tagalog</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={formData.tempo || ''}
                  onChange={(e) => handleInputChange('tempo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Signature
                </label>
                <select
                  value={formData.timeSignature}
                  onChange={(e) => handleInputChange('timeSignature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="4/4">4/4</option>
                  <option value="3/4">3/4</option>
                  <option value="6/8">6/8</option>
                  <option value="2/4">2/4</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Add any notes about this song..."
                />
              </div>
            </div>

            {/* Chord Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chord Sections</h3>
                <button
                  type="button"
                  onClick={addChordSection}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {chordSections.map((section, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={section.section}
                        onChange={(e) => handleChordSectionChange(index, 'section', e.target.value)}
                        className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0 focus:border-0 text-gray-900 dark:text-white"
                        placeholder="Section name (e.g., Verse 1, Chorus)"
                      />
                      {chordSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChordSection(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Chord Progression
                        </label>
                        <textarea
                          value={section.chords}
                          onChange={(e) => handleChordSectionChange(index, 'chords', e.target.value)}
                          placeholder="e.g., C - F - G - Am"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Lyrics
                        </label>
                        <textarea
                          value={section.lyrics}
                          onChange={(e) => handleChordSectionChange(index, 'lyrics', e.target.value)}
                          placeholder="Enter lyrics for this section..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Lyrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complete Lyrics (Optional)
              </label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
                placeholder="Enter complete song lyrics..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={6}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Song
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}