'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Music, User, Hash, RotateCcw, Copy, Check, Edit, Save, X } from 'lucide-react'
import { transposeChordProgression, getAllKeys, calculateTransposeSteps } from '@/utils/chordTransposer'
import Link from 'next/link'

interface ChordSection {
  id: string
  section: string
  chords: string
  lyrics: string
  key: string
}

interface Song {
  id: string
  title: string
  originalKey: string
  currentKey: string
  worshipLeader: string
  category: string
  lyrics: string
  chordSections: ChordSection[]
}

interface SongDetailViewProps {
  song: Song
}

export function SongDetailView({ song: initialSong }: SongDetailViewProps) {
  const [song, setSong] = useState(initialSong)
  const [selectedKey, setSelectedKey] = useState(song.currentKey)
  const [isEditing, setIsEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState(song.lyrics)
  const [copied, setCopied] = useState(false)

  const keys = getAllKeys()

  useEffect(() => {
    if (selectedKey !== song.currentKey) {
      const transposeSteps = calculateTransposeSteps(song.currentKey, selectedKey)

      const transposedSections = song.chordSections.map(section => ({
        ...section,
        chords: transposeChordProgression(section.chords, transposeSteps),
        key: selectedKey
      }))

      setSong(prev => ({
        ...prev,
        currentKey: selectedKey,
        chordSections: transposedSections
      }))
    }
  }, [selectedKey, song.currentKey, song.chordSections])

  const handleResetKey = () => {
    setSelectedKey(song.originalKey)
  }

  const handleCopyChords = async () => {
    const chordsText = song.chordSections
      .map(section => `${section.section}:\n${section.chords}\n`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(chordsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
    }
  }

  const handleSaveEdit = () => {
    setSong(prev => ({ ...prev, lyrics: editedLyrics }))
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedLyrics(song.lyrics)
    setIsEditing(false)
  }

  const renderLyricsWithChords = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <textarea
            value={editedLyrics}
            onChange={(e) => setEditedLyrics(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter lyrics here..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {song.chordSections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {section.section}
              </h4>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                {section.key}
              </span>
            </div>

            <div className="space-y-2">
              <div className="chord-line p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                {section.chords}
              </div>
              <div className="lyrics-line p-2 bg-gray-50 rounded">
                {section.lyrics.split('\n').map((line, index) => (
                  <div key={index} className="leading-relaxed">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {song.lyrics && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Complete Lyrics
            </h4>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {song.lyrics}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {song.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {song.worshipLeader}
              </div>
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {song.category}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Lyrics'}
            </button>
            <button
              onClick={handleCopyChords}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Copy Chords'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Adjustment
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Original Key:</span>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
              {song.originalKey}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Current Key:
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {keys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>

            {selectedKey !== song.originalKey && (
              <button
                onClick={handleResetKey}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {selectedKey !== song.originalKey && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Transposed:</strong> {song.originalKey} → {selectedKey}
              {' '}({calculateTransposeSteps(song.originalKey, selectedKey) > 0 ? '+' : ''}{calculateTransposeSteps(song.originalKey, selectedKey)} semitones)
            </p>
          </div>
        )}
      </div>

      {/* Song Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Song Structure & Chords
          </h3>
          <span className="text-sm text-gray-500">
            Key: {song.currentKey}
          </span>
        </div>

        {renderLyricsWithChords()}
      </div>
    </div>
  )
}