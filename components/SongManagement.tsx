'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Download, Search, Filter, Edit, Trash2, Globe } from 'lucide-react'
import { SongTable } from './SongTable'
import { SongEditor } from './SongEditor'
import { AddSongModal } from './AddSongModal'
import { WebScrapeModal } from './WebScrapeModal'
import { SongsService } from '@/lib/songsData'

interface Song {
  id: string
  title: string
  default_key: string
  primary_worship_leader: {
    display_name: string
  } | null
  category?: string
}

interface WorshipLeader {
  display_name: string
}

const categories = ['Worship', 'Praise', 'Contemporary', 'Traditional', 'Filipino', 'English']

export function SongManagement() {
  const [songs, setSongs] = useState<Song[]>([])
  const [worshipLeaders, setWorshipLeaders] = useState<WorshipLeader[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeader, setSelectedLeader] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWebScrapeModal, setShowWebScrapeModal] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [sortField, setSortField] = useState<'title' | 'lastUsed' | 'frequency'>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editingSong, setEditingSong] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const songsData = SongsService.getSongs()
        const leadersData = SongsService.getWorshipLeaders()

        // Transform to component format
        const transformedSongs = songsData.map(song => ({
          id: song.id,
          title: song.title,
          default_key: song.defaultKey,
          primary_worship_leader: song.worshipLeaders.length > 0
            ? { display_name: song.worshipLeaders[0].name }
            : null,
          category: song.tags[0]
        }))

        const transformedLeaders = leadersData.map(leader => ({
          display_name: leader.displayName
        }))

        setSongs(transformedSongs)
        setWorshipLeaders(transformedLeaders)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Transform songs for filtering and table display
  const transformedSongs = songs.map(song => ({
    id: song.id,
    title: song.title,
    key: song.default_key,
    worshipLeader: song.primary_worship_leader?.display_name || 'Unassigned',
    category: song.category || 'Contemporary',
    songType: 'Slow',
    language: 'English',
    lastUsed: new Date().toISOString().split('T')[0], // Default to today
    frequency: 1 // Default frequency
  }))

  // Filter and sort songs
  const filteredAndSortedSongs = transformedSongs
    .filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLeader = selectedLeader === 'all' || song.worshipLeader === selectedLeader
      const matchesCategory = selectedCategory === 'all' || song.category === selectedCategory
      return matchesSearch && matchesLeader && matchesCategory
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (sortField === 'lastUsed') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue)
      } else {
        return sortDirection === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue
      }
    })

  const handleAddSong = (newSong: any) => {
    const song = {
      id: Date.now().toString(),
      title: newSong.title,
      key: newSong.key,
      worshipLeader: newSong.worshipLeader,
      category: newSong.category,
      lastUsed: new Date().toISOString().split('T')[0],
      frequency: 0
    }
    setSongs(prev => [...prev, song])
    setShowAddModal(false)
  }

  const handleWebScrapeData = (scrapedData: any) => {
    const song = {
      id: Date.now().toString(),
      title: scrapedData.title,
      key: scrapedData.key || 'C',
      worshipLeader: 'Unassigned',
      category: 'Contemporary',
      lastUsed: new Date().toISOString().split('T')[0],
      frequency: 0
    }
    setSongs(prev => [...prev, song])
    setShowWebScrapeModal(false)
  }

  const handleDeleteSongs = () => {
    setSongs(prev => prev.filter(song => !selectedSongs.includes(song.id)))
    setSelectedSongs([])
  }

  const handleEditSong = async (song: any) => {
    try {
      // Fetch complete song data including chord sections
      const fullSongData = await SupabaseService.getSongById(song.id)

      // Convert song to editor format
      const editorSong = {
        id: fullSongData.id,
        title: fullSongData.title,
        originalKey: fullSongData.original_key || song.key,
        currentKey: fullSongData.default_key || song.key,
        worshipLeader: song.worshipLeader,
        category: fullSongData.category || song.category,
        songType: fullSongData.song_type || 'Slow',
        language: fullSongData.language || 'English',
        tempo: fullSongData.tempo,
        timeSignature: fullSongData.time_signature,
        sections: fullSongData.chord_sections?.map((section: any) => ({
          id: section.id,
          type: section.section_type,
          label: section.section_label,
          content: section.content || '',
          chords: section.chords || ''
        })) || [],
        notes: fullSongData.notes || ''
      }
      setEditingSong(editorSong)
      setShowEditor(true)
    } catch (error) {
      console.error('Error loading song for editing:', error)
      // Fallback to basic song data
      const editorSong = {
        id: song.id,
        title: song.title,
        originalKey: song.key,
        currentKey: song.key,
        worshipLeader: song.worshipLeader,
        category: song.category,
        sections: [],
        notes: ''
      }
      setEditingSong(editorSong)
      setShowEditor(true)
    }
  }

  const handleSaveSong = async (songData: any) => {
    console.log('SongManagement handleSaveSong called with:', {
      title: songData.title,
      id: songData.id,
      sectionsCount: songData.sections?.length || 0,
      sections: songData.sections?.map((s: any) => ({
        id: s.id,
        type: s.type,
        label: s.label,
        chordsLength: s.chords?.length || 0,
        contentLength: s.content?.length || 0
      })) || []
    })

    try {
      console.log('Saving song:', songData)

      if (songData.id) {
        // Update song with all available fields
        const updateData: any = {
          title: songData.title,
          original_key: songData.originalKey,
          default_key: songData.currentKey
        }

        // Add optional fields if they exist in songData
        if (songData.category) updateData.category = songData.category
        if (songData.songType) updateData.song_type = songData.songType
        if (songData.language) updateData.language = songData.language
        if (songData.tempo) updateData.tempo = songData.tempo
        if (songData.timeSignature) updateData.time_signature = songData.timeSignature
        if (songData.notes) updateData.notes = songData.notes

        console.log('About to update song with data:', updateData)
        await SupabaseService.updateSong(songData.id, updateData)
        console.log('Song updated successfully with all fields')

        // Update song sections with error handling
        if (songData.sections && songData.sections.length > 0) {
          try {
            console.log('Attempting to save sections:', songData.sections.length, 'sections')
            console.log('Section data structure:', JSON.stringify(songData.sections, null, 2))

            for (const section of songData.sections) {
              console.log('Processing section:', {
                id: section.id,
                type: section.type,
                label: section.label,
                contentLength: section.content?.length || 0,
                chordsLength: section.chords?.length || 0
              })

              // Validate section data
              if (!section.type || !section.label) {
                console.warn('Skipping invalid section (missing type or label):', section)
                continue
              }

              // Check if this is an existing section by trying to find it in the database first
              const isExistingSection = section.id && section.id.length > 30 // UUIDs are longer than 30 chars

              if (isExistingSection) {
                try {
                  // Try to update existing section
                  console.log('Attempting to update existing section:', section.id)
                  await SupabaseService.updateChordSection(section.id, {
                    section_type: section.type,
                    section_label: section.label,
                    content: section.content || '',
                    chords: section.chords || ''
                  })
                  console.log('Successfully updated existing section:', section.id)
                } catch (updateError: any) {
                  if (updateError.code === 'PGRST116' || updateError.message?.includes('0 rows')) {
                    // Section doesn't exist in database, create it as new
                    console.log('Section not found in DB, creating as new:', section.id)
                    await SupabaseService.createChordSection({
                      song_id: songData.id,
                      section_type: section.type,
                      section_label: section.label,
                      content: section.content || '',
                      chords: section.chords || '',
                      section_order: songData.sections.indexOf(section)
                    })
                    console.log('Successfully created section that was not found:', section.id)
                  } else {
                    throw updateError // Re-throw if it's a different error
                  }
                }
              } else {
                // New section
                console.log('Creating new section:', section.type, section.label)
                await SupabaseService.createChordSection({
                  song_id: songData.id,
                  section_type: section.type,
                  section_label: section.label,
                  content: section.content || '',
                  chords: section.chords || '',
                  section_order: songData.sections.indexOf(section)
                })
                console.log('Successfully created new section:', section.type, section.label)
              }
            }
            console.log('Successfully saved all sections')
          } catch (sectionError: any) {
            console.error('Error updating sections:', {
              error: sectionError,
              message: sectionError instanceof Error ? sectionError.message : 'Unknown error',
              code: sectionError?.code,
              details: sectionError?.details,
              hint: sectionError?.hint,
              sectionsData: songData.sections,
              sectionCount: songData.sections?.length || 0
            })

            // Check if it's a table not found error
            if (sectionError?.code === '42P01' || sectionError?.message?.includes('chord_sections')) {
              console.warn('chord_sections table not found - skipping section updates for now')
              alert('Note: Chord sections feature requires database table setup. Song basic info was saved successfully.')
            }
            // Don't throw - sections are optional, song update was successful
          }
        }

        // Refresh songs list with error handling
        try {
          const [songsData, leadersData] = await Promise.all([
            SupabaseService.getSongs(),
            SupabaseService.getWorshipLeaders()
          ])
          setSongs(songsData || [])
          setWorshipLeaders(leadersData || [])
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError)
          // Don't throw - the save was successful, just refresh failed
        }
      }

      setShowEditor(false)
      setEditingSong(null)
    } catch (error: any) {
      console.error('Error saving song:', error)
      console.error('Error message:', error?.message)
      console.error('Error code:', error?.code)
      console.error('Error details:', error?.details)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      alert(`Failed to save song: ${error?.message || 'Unknown error'}. Please try again.`)
    }
  }

  const handleExportData = () => {
    const exportData = songs.map(song => ({
      Title: song.title,
      Key: song.key,
      'Worship Leader': song.worshipLeader,
      Category: song.category,
      'Last Used': song.lastUsed,
      'Times Played': song.frequency
    }))

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ignite-chords-songs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    totalSongs: transformedSongs.length,
    recentlyAdded: transformedSongs.filter(s => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(s.lastUsed) >= weekAgo
    }).length,
    mostPopular: transformedSongs.length > 0 ? transformedSongs.reduce((prev, current) =>
      prev.frequency > current.frequency ? prev : current
    ).title : 'N/A',
    totalLeaders: worshipLeaders.length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Songs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSongs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recently Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentlyAdded}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Popular</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{stats.mostPopular}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Worship Leaders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLeaders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Song Library</h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                Add Song
              </button>
              <button
                onClick={() => setShowWebScrapeModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Globe className="w-4 h-4" />
                Import from Web
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {selectedSongs.length > 0 && (
                <button
                  onClick={handleDeleteSongs}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedSongs.length})
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedLeader}
                onChange={(e) => setSelectedLeader(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Leaders</option>
                {worshipLeaders.map(leader => (
                  <option key={leader.display_name} value={leader.display_name}>{leader.display_name}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  setSortField(field as typeof sortField)
                  setSortDirection(direction as typeof sortDirection)
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="lastUsed-desc">Recently Used</option>
                <option value="frequency-desc">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <SongTable
            songs={filteredAndSortedSongs}
            selectedSongs={selectedSongs}
            onSelectionChange={setSelectedSongs}
            onEditSong={handleEditSong}
          />

          {filteredAndSortedSongs.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No songs found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSongModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSong={handleAddSong}
        worshipLeaders={worshipLeaders.map(l => l.display_name)}
        categories={categories}
      />

      <WebScrapeModal
        isOpen={showWebScrapeModal}
        onClose={() => setShowWebScrapeModal(false)}
        onSongDataReceived={handleWebScrapeData}
      />

      {/* Song Editor Modal */}
      <SongEditor
        song={editingSong}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveSong}
      />
    </div>
  )
}