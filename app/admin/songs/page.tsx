'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminProtected } from '@/components/AdminProtected'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { SongsService } from '@/lib/songsData'
import {
  Search, Plus, Download, LogOut, Edit, Table2,
  ChevronDown, ChevronUp, Trash2, Save, X, FileText, Upload, Users
} from 'lucide-react'

export default function AdminSongsPage() {
  return (
    <AdminProtected>
      <AdminSongsContent />
    </AdminProtected>
  )
}

function AdminSongsContent() {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [songs, setSongs] = useState<any[]>([])
  const [filteredSongs, setFilteredSongs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date'>('alphabetical')
  const [editedSongs, setEditedSongs] = useState<{ [key: string]: any }>({})
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [showImportSection, setShowImportSection] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importTitle, setImportTitle] = useState('')
  const [importLyrics, setImportLyrics] = useState('')

  useEffect(() => {
    loadSongs()
  }, [])

  useEffect(() => {
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      } else {
        return b.id.localeCompare(a.id) // Newer first
      }
    })
    setFilteredSongs(filtered)
  }, [searchTerm, songs, sortBy])

  const loadSongs = () => {
    const songsData = SongsService.getSongs()
    setSongs(songsData)
    setFilteredSongs(songsData)
  }

  const handleDownloadJSON = async () => {
    // Try to save to file first on localhost
    try {
      const response = await fetch('/api/songs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Saved to data/songs.json! ✓\n${songs.length} songs saved.`)
        // Clear all edited states
        setEditedSongs({})
        return
      }
    } catch (error) {
      // Fall through to download
    }

    // Fallback: download JSON file
    const dataStr = JSON.stringify({ songs, lastUpdated: new Date().toISOString() }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `songs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    alert('Downloaded JSON file. (Auto-save only works on localhost)')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getEditedSong = (song: any) => {
    return editedSongs[song.id] || song
  }

  const addNewSong = () => {
    const newSong = {
      id: `song_${Date.now()}`,
      title: 'New Song',
      artist: '',
      originalKey: 'C',
      defaultKey: 'C',
      ccli: '',
      tags: [],
      worshipLeaders: [],
      structure: [],
      sections: [],
      songType: 'Slow',
      language: 'English',
      isActive: true,
      externalUrl: null
    }
    setSongs(prev => [newSong, ...prev])
    setExpandedIds(prev => [newSong.id, ...prev])
    alert('New song added! Remember to download the JSON when done.')
  }

  const updateField = (songId: string, field: string, value: any) => {
    setEditedSongs(prev => ({
      ...prev,
      [songId]: {
        ...(prev[songId] || songs.find(s => s.id === songId)),
        [field]: value
      }
    }))
  }

  const saveSong = async (songId: string) => {
    // If no changes, just save current state to file
    const songToSave = editedSongs[songId] || songs.find(s => s.id === songId)
    if (!songToSave) return

    const updatedSongs = songs.map(s => s.id === songId ? songToSave : s)
    setSongs(updatedSongs)

    // Try to save to file on localhost
    try {
      const response = await fetch('/api/songs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: updatedSongs })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Song saved to data/songs.json! ✓')
        // Clear the edited state for this song
        setEditedSongs(prev => {
          const newEdited = { ...prev }
          delete newEdited[songId]
          return newEdited
        })
      } else {
        alert(`Saved locally only. ${result.error || 'Could not save to file.'}`)
      }
    } catch (error) {
      alert('Song saved locally. (File save only works on localhost)')
    }
  }

  const resetSong = (songId: string) => {
    setEditedSongs(prev => {
      const newEdited = { ...prev }
      delete newEdited[songId]
      return newEdited
    })
  }

  const deleteSong = async (id: string) => {
    const songToDelete = songs.find(s => s.id === id)
    if (!songToDelete) return

    if (confirm(`Are you sure you want to delete "${songToDelete.title}"?\n\nThis action cannot be undone.`)) {
      const updatedSongs = songs.filter(s => s.id !== id)
      setSongs(updatedSongs)

      // Try to save to file automatically on localhost
      try {
        const response = await fetch('/api/songs/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songs: updatedSongs })
        })

        const result = await response.json()

        if (response.ok) {
          alert(`Song "${songToDelete.title}" deleted and saved! ✓`)
        } else {
          alert(`Song deleted locally. ${result.error || 'Remember to download the JSON file.'}`)
        }
      } catch (error) {
        alert('Song deleted locally. Remember to download the JSON file.')
      }
    }
  }

  const addSection = (songId: string) => {
    const currentSong = getEditedSong(songs.find(s => s.id === songId))
    const newSection = {
      id: `section_${Date.now()}`,
      name: 'New Section',
      order: currentSong.sections?.length + 1 || 1,
      chords: '',
      snippet: '',
      notes: ''
    }
    updateField(songId, 'sections', [...(currentSong.sections || []), newSection])
  }

  const removeSection = (songId: string, sectionId: string) => {
    const currentSong = getEditedSong(songs.find(s => s.id === songId))
    const newSections = currentSong.sections
      .filter((s: any) => s.id !== sectionId)
      .map((s: any, idx: number) => ({ ...s, order: idx + 1 }))
    updateField(songId, 'sections', newSections)
  }

  const updateSection = (songId: string, sectionId: string, field: string, value: string) => {
    const currentSong = getEditedSong(songs.find(s => s.id === songId))
    const newSections = currentSong.sections.map((s: any) =>
      s.id === sectionId ? { ...s, [field]: value } : s
    )
    updateField(songId, 'sections', newSections)
  }

  const processImportAndUpdate = async (contentToImport: string, existingSong: any, skipLines: number, lines: string[], title: string, artist: string) => {
    let sections: any[] = []
    let currentSection: any = null

    // Parse sections from imported content
    for (let i = skipLines; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed && !currentSection) continue

      const sectionMatch = trimmed.match(/^(\[)?(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag|Refrain|Interlude)(\s*\d+)?(\])?:?/i)
      if (sectionMatch) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          id: `section_${Date.now()}_${sections.length}`,
          name: sectionMatch[0].replace(/[\[\]:]/g, '').trim(),
          order: sections.length + 1,
          chords: '',
          snippet: '',
          lyrics: [],
          notes: ''
        }
        continue
      }

      if (currentSection && trimmed) {
        const chordPattern = /\b[A-G](#|b)?(m|maj|min|sus|dim|aug|add)?\d*(\/[A-G](#|b)?)?(\s+|$)/g
        const chordMatches = trimmed.match(chordPattern)
        const isChordLine = chordMatches && chordMatches.length >= 2 && trimmed.length < 80

        if (isChordLine) {
          currentSection.chords += (currentSection.chords ? '\n' : '') + trimmed
        } else {
          currentSection.lyrics.push(trimmed)
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    // Create snippets
    sections = sections.map(section => {
      const snippetLines = section.lyrics.slice(0, 2)
      const snippet = snippetLines.join(' / ')
      return {
        ...section,
        snippet: snippet || '(no lyrics)',
        lyrics: undefined
      }
    })

    // Detect key
    let detectedKey = existingSong.originalKey || 'C'
    if (sections.length > 0 && sections[0].chords) {
      const firstChord = sections[0].chords.match(/\b([A-G](#|b)?)(m|maj|min)?\b/)
      if (firstChord) {
        detectedKey = firstChord[1]
      }
    }

    // Update existing song with new data
    const updatedSong = {
      ...existingSong,
      artist: artist || existingSong.artist,
      originalKey: detectedKey,
      structure: sections.map(s => s.name),
      sections: sections,
      externalUrl: importUrl || existingSong.externalUrl
    }

    // Update songs array
    const updatedSongs = songs.map(s => s.id === existingSong.id ? updatedSong : s)
    setSongs(updatedSongs)
    setExpandedIds(prev => prev.includes(existingSong.id) ? prev : [existingSong.id, ...prev])

    setImportLyrics('')
    setImportUrl('')
    setImportTitle('')
    setShowImportSection(false)
    alert(`Song "${title}" updated with new chords and sections! Review and save.`)
  }

  const handleImportSong = async () => {
    let contentToImport = importLyrics.trim()

    // If URL is provided, try to fetch it
    if (importUrl.trim()) {
      try {
        alert('URL fetching is not yet implemented. Please copy/paste the lyrics and chords manually for now.')
        return
      } catch (error) {
        alert('Could not fetch from URL. Please copy/paste the content manually.')
        return
      }
    }

    if (!contentToImport) {
      alert('Please paste song lyrics and chords')
      return
    }

    // Parse the lyrics/chords text
    const lines = contentToImport.split('\n')
    let title = importTitle.trim() || 'Imported Song'
    let artist = ''
    let sections: any[] = []
    let currentSection: any = null
    let skipLines = 0

    // Try to extract title and artist from first few lines (only if title field is empty)
    if (!importTitle.trim()) {
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Check if it's a title (usually first non-empty line, not a chord line)
        if (!title || title === 'Imported Song') {
          if (!line.match(/^[A-G](#|b)?(m|maj|min|sus|dim|aug)?\d?/) && !line.match(/^\[/)) {
            title = line
            skipLines = i + 1
            continue
          }
        }

        // Check if next line looks like artist (often "by Artist Name" or just artist name)
        if (i === skipLines && line.toLowerCase().startsWith('by ')) {
          artist = line.replace(/^by\s+/i, '').trim()
          skipLines = i + 1
          continue
        }
      }
    } else {
      // If manual title provided, still try to get artist from content
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim()
        if (line.toLowerCase().startsWith('by ')) {
          artist = line.replace(/^by\s+/i, '').trim()
          skipLines = i + 1
          break
        }
      }
    }

    // Check if song with same title already exists
    const existingSong = songs.find(s =>
      s.title.toLowerCase().trim() === title.toLowerCase().trim()
    )

    if (existingSong) {
      const action = confirm(
        `A song titled "${title}" already exists.\n\n` +
        `Click OK to UPDATE/MERGE the existing song with new chords.\n` +
        `Click Cancel to CREATE A NEW separate song.`
      )

      if (!action) {
        // User chose Cancel - will create new song, let it continue
        title = `${title} (Imported ${new Date().toLocaleDateString()})`
      } else {
        // User chose OK - will update existing song
        await processImportAndUpdate(contentToImport, existingSong, skipLines, lines, title, artist)
        return
      }
    }

    // Parse sections
    for (let i = skipLines; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Skip empty lines between sections
      if (!trimmed && !currentSection) continue

      // Check if it's a section header (Verse 1, Chorus, Bridge, etc.)
      const sectionMatch = trimmed.match(/^(\[)?(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag|Refrain|Interlude)(\s*\d+)?(\])?:?/i)
      if (sectionMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection)
        }
        // Start new section
        currentSection = {
          id: `section_${Date.now()}_${sections.length}`,
          name: sectionMatch[0].replace(/[\[\]:]/g, '').trim(),
          order: sections.length + 1,
          chords: '',
          snippet: '',
          lyrics: [],
          notes: ''
        }
        continue
      }

      if (currentSection && trimmed) {
        // Check if line contains primarily chords (chord-heavy line)
        const chordPattern = /\b[A-G](#|b)?(m|maj|min|sus|dim|aug|add)?\d*(\/[A-G](#|b)?)?(\s+|$)/g
        const chordMatches = trimmed.match(chordPattern)

        // If line has multiple chords and few regular words, it's a chord line
        const isChordLine = chordMatches && chordMatches.length >= 2 && trimmed.length < 80

        if (isChordLine) {
          // It's a chord line - add to chords
          currentSection.chords += (currentSection.chords ? '\n' : '') + trimmed
        } else {
          // It's lyrics - add to lyrics array
          currentSection.lyrics.push(trimmed)
        }
      }
    }

    // Save last section
    if (currentSection) {
      sections.push(currentSection)
    }

    // Create snippets (first line or two of each section)
    sections = sections.map(section => {
      const snippetLines = section.lyrics.slice(0, 2) // Take first 2 lines
      const snippet = snippetLines.join(' / ')
      return {
        ...section,
        snippet: snippet || '(no lyrics)',
        lyrics: undefined // Remove full lyrics from final object
      }
    })

    // Try to detect key from chords
    let detectedKey = 'C'
    if (sections.length > 0 && sections[0].chords) {
      const firstChord = sections[0].chords.match(/\b([A-G](#|b)?)(m|maj|min)?\b/)
      if (firstChord) {
        detectedKey = firstChord[1]
      }
    }

    // Create new song
    const newSong = {
      id: `song_${Date.now()}`,
      title: title,
      artist: artist,
      originalKey: detectedKey,
      defaultKey: detectedKey,
      ccli: '',
      tags: [],
      worshipLeaders: [],
      structure: sections.map(s => s.name),
      sections: sections,
      songType: 'Slow',
      language: 'English',
      isActive: true,
      externalUrl: importUrl || null
    }

    setSongs(prev => [newSong, ...prev])
    setExpandedIds(prev => [newSong.id, ...prev])
    setImportLyrics('')
    setImportUrl('')
    setImportTitle('')
    setShowImportSection(false)
    alert('Song imported! Snippets created from first lines. Review and edit as needed, then save.')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Song Editor
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {songs.length} songs total
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={addNewSong}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Song
              </button>
              <button
                onClick={() => setShowImportSection(!showImportSection)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Import Song
              </button>
              <button
                onClick={() => router.push('/admin/bulk')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                <Table2 className="w-4 h-4" />
                Bulk Edit
              </button>
              <button
                onClick={handleDownloadJSON}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'date')}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="alphabetical">A-Z</option>
              <option value="date">Newest First</option>
            </select>
          </div>

          {/* Import Section */}
          {showImportSection && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2 sticky top-0 bg-indigo-50 dark:bg-indigo-900/20 pb-2">
                <FileText className="w-5 h-5" />
                Import Song from Lyrics & Chords
              </h3>

              <div className="space-y-3">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                    Song Title <span className="text-indigo-600">(Manual Override)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Alabaster Jar (leave empty to auto-detect)"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
                  />
                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    💡 Enter exact title to update existing song (e.g., "Alabaster Jar") or leave empty to auto-detect
                  </p>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                    Source URL (Optional - for reference only)
                  </label>
                  <input
                    type="url"
                    placeholder="https://tabs.ultimate-guitar.com/tab/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    Save the source URL for reference (e.g., from Ultimate Guitar, Worship Together)
                  </p>
                </div>

                {/* Lyrics & Chords Textarea */}
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">
                    Copy/Paste Entire Song (Lyrics & Chords)
                  </label>
                  <textarea
                    placeholder="Paste complete song from Ultimate Guitar or similar site...&#10;&#10;Example:&#10;Alabaster Jar&#10;by Tenth Avenue North&#10;&#10;[Verse 1]&#10;C        Am       F&#10;This alabaster jar is all I have of worth&#10;C        Am       F&#10;I break it at Your feet, Lord&#10;&#10;[Chorus]&#10;G             C           F&#10;Take my life and let it be&#10;G             C           F&#10;Consecrated Lord to Thee"
                    value={importLyrics}
                    onChange={(e) => setImportLyrics(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono resize-y"
                    rows={10}
                  />
                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    ✨ Auto-detects: Title, Artist, Sections, Chords, and creates snippets from first 1-2 lines of lyrics
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleImportSong}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Import Song
                  </button>
                  <button
                    onClick={() => {
                      setShowImportSection(false)
                      setImportUrl('')
                      setImportTitle('')
                      setImportLyrics('')
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Songs List */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredSongs.map(song => {
            const displaySong = getEditedSong(song)
            const hasChanges = !!editedSongs[song.id]
            const isExpanded = expandedIds.includes(song.id)

            return (
              <div
                key={song.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${
                  hasChanges ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                } overflow-hidden transition-all`}
              >
                {/* Card Header */}
                <div
                  className="p-4 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  onClick={() => toggleExpand(song.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {displaySong.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {displaySong.artist && <span>{displaySong.artist}</span>}
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          Key: {displaySong.originalKey}
                        </span>
                        {hasChanges && (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs">
                            Unsaved
                          </span>
                        )}
                        {displaySong.worshipLeaders && displaySong.worshipLeaders.length > 0 && (
                          <span className="text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {displaySong.worshipLeaders.map((wl: any, idx: number) => (
                              <span key={idx}>
                                {wl.name} ({wl.preferredKey}){idx < displaySong.worshipLeaders.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        )}
                        {displaySong.sections?.length > 0 && (
                          <span className="text-xs">
                            {displaySong.sections.length} sections
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          saveSong(song.id)
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      {hasChanges && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            resetSong(song.id)
                          }}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1 text-sm"
                        >
                          <X className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSong(song.id)
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button className="p-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Fields - Collapsible */}
                {isExpanded && (
                <div className="p-4 border-t dark:border-gray-700 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={displaySong.title}
                        onChange={(e) => updateField(song.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Artist</label>
                      <input
                        type="text"
                        value={displaySong.artist || ''}
                        onChange={(e) => updateField(song.id, 'artist', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Original Key</label>
                      <select
                        value={displaySong.originalKey || 'C'}
                        onChange={(e) => {
                          updateField(song.id, 'originalKey', e.target.value)
                          // Also update defaultKey to match originalKey
                          updateField(song.id, 'defaultKey', e.target.value)
                        }}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CCLI Number</label>
                      <input
                        type="text"
                        value={displaySong.ccli || ''}
                        onChange={(e) => updateField(song.id, 'ccli', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., 7095024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Song Type</label>
                      <select
                        value={displaySong.songType || 'Slow'}
                        onChange={(e) => updateField(song.id, 'songType', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="Slow">Slow</option>
                        <option value="Upbeat">Upbeat</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Language</label>
                      <select
                        value={displaySong.language || 'English'}
                        onChange={(e) => updateField(song.id, 'language', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="English">English</option>
                        <option value="Tagalog">Tagalog</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(displaySong.tags || []).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => {
                              const newTags = displaySong.tags.filter((_: string, i: number) => i !== idx)
                              updateField(song.id, 'tags', newTags)
                            }}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`tag-input-${song.id}`}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget
                            const tag = input.value.trim()
                            if (tag) {
                              updateField(song.id, 'tags', [...(displaySong.tags || []), tag])
                              input.value = ''
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`tag-input-${song.id}`) as HTMLInputElement
                          const tag = input?.value.trim()
                          if (tag) {
                            updateField(song.id, 'tags', [...(displaySong.tags || []), tag])
                            input.value = ''
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Worship Leaders */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Worship Leaders</label>
                      <button
                        onClick={() => {
                          const newLeader = { name: 'New Leader', preferredKey: 'C' }
                          updateField(song.id, 'worshipLeaders', [...(displaySong.worshipLeaders || []), newLeader])
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1 hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        Add Leader
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(displaySong.worshipLeaders || []).map((leader: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={leader.name}
                            onChange={(e) => {
                              const newLeaders = [...displaySong.worshipLeaders]
                              newLeaders[idx] = { ...newLeaders[idx], name: e.target.value }
                              updateField(song.id, 'worshipLeaders', newLeaders)
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Leader name"
                          />
                          <select
                            value={leader.preferredKey}
                            onChange={(e) => {
                              const newLeaders = [...displaySong.worshipLeaders]
                              newLeaders[idx] = { ...newLeaders[idx], preferredKey: e.target.value }
                              updateField(song.id, 'worshipLeaders', newLeaders)
                            }}
                            className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                              <option key={key} value={key}>{key}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const newLeaders = displaySong.worshipLeaders.filter((_: any, i: number) => i !== idx)
                              updateField(song.id, 'worshipLeaders', newLeaders)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Structure */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Song Structure</label>
                      <button
                        onClick={() => {
                          updateField(song.id, 'structure', [...(displaySong.structure || []), 'New Part'])
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1 hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        Add Part
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(displaySong.structure || []).map((part: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 w-8">{idx + 1}.</span>
                          <input
                            type="text"
                            value={part}
                            onChange={(e) => {
                              const newStructure = [...displaySong.structure]
                              newStructure[idx] = e.target.value
                              updateField(song.id, 'structure', newStructure)
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const newStructure = displaySong.structure.filter((_: string, i: number) => i !== idx)
                              updateField(song.id, 'structure', newStructure)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sections */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Sections (Chords & Lyrics)</label>
                      <button
                        onClick={() => addSection(song.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1 hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        Add Section
                      </button>
                    </div>

                    <div className="space-y-2">
                      {displaySong.sections?.map((section: any) => (
                        <div key={section.id} className="border dark:border-gray-600 rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-700/30">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) => updateSection(song.id, section.id, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Section name (e.g., Verse 1, Chorus)"
                            />
                            <button
                              onClick={() => removeSection(song.id, section.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="relative">
                            <textarea
                              id={`chords-${song.id}-${section.id}`}
                              value={section.chords || ''}
                              onChange={(e) => updateSection(song.id, section.id, 'chords', e.target.value)}
                              className="w-full px-2 py-1 pr-16 border rounded text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
                              placeholder="C G Am F (Use | for bars)"
                              rows={2}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const textarea = document.getElementById(`chords-${song.id}-${section.id}`) as HTMLTextAreaElement
                                if (textarea) {
                                  const start = textarea.selectionStart
                                  const end = textarea.selectionEnd
                                  const value = textarea.value
                                  const newValue = value.substring(0, start) + '\n' + value.substring(end)
                                  updateSection(song.id, section.id, 'chords', newValue)
                                  setTimeout(() => {
                                    textarea.focus()
                                    textarea.selectionStart = textarea.selectionEnd = start + 1
                                  }, 0)
                                }
                              }}
                              className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-medium transition-colors"
                              title="Add new line"
                            >
                              + Line
                            </button>
                          </div>
                          <textarea
                            value={section.snippet || ''}
                            onChange={(e) => updateSection(song.id, section.id, 'snippet', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Lyrics snippet"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}