'use client'

import { useState, useEffect } from 'react'
import { Search, Music, Users, BookOpen, Plus } from 'lucide-react'
import { SongCard } from './SongCard'
import { SongTable } from './SongTable'
import { SongEditor } from './SongEditor'
import { SongsService, type Song as SongType } from '@/lib/songsData'

interface DisplaySong {
  id: string
  title: string
  default_key: string
  primary_worship_leader: {
    display_name: string
  } | null
  category?: string
  song_type?: string
  language?: string
}

interface WorshipLeader {
  display_name: string
  songCount: number
}

export function SongDashboard() {
  const [songs, setSongs] = useState<DisplaySong[]>([])
  const [worshipLeaders, setWorshipLeaders] = useState<WorshipLeader[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeader, setSelectedLeader] = useState('all')
  const [selectedKey, setSelectedKey] = useState('all')
  const [selectedSongType, setSelectedSongType] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date'>('alphabetical')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    // Default to grid on mobile, table on desktop
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'table'
    }
    return 'table'
  })
  const [editingSong, setEditingSong] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const songsData = SongsService.getSongs()
        const leadersData = SongsService.getWorshipLeaders()

        // Transform to DisplaySong format
        const displaySongs: DisplaySong[] = songsData.map(song => ({
          id: song.id,
          title: song.title,
          default_key: song.defaultKey,
          primary_worship_leader: song.worshipLeaders && song.worshipLeaders.length > 0
            ? { display_name: song.worshipLeaders[0].name }
            : null,
          category: song.tags && song.tags[0] ? song.tags[0] : undefined,
          song_type: song.songType || 'Slow',
          language: song.language || 'English'
        }))

        // Transform worship leaders with song count
        const leaderStats: WorshipLeader[] = leadersData.map(leader => ({
          display_name: leader.displayName,
          songCount: songsData.filter(s =>
            s.worshipLeaders.some(wl => wl.name === leader.name)
          ).length
        }))

        setSongs(displaySongs)
        setWorshipLeaders(leaderStats)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase())
    const worshipLeaderName = song.primary_worship_leader?.display_name || 'Unassigned'
    const matchesLeader = selectedLeader === 'all' || worshipLeaderName === selectedLeader
    const matchesKey = selectedKey === 'all' || song.default_key === selectedKey
    const matchesSongType = selectedSongType === 'all' || song.song_type === selectedSongType
    const matchesLanguage = selectedLanguage === 'all' || song.language === selectedLanguage
    return matchesSearch && matchesLeader && matchesKey && matchesSongType && matchesLanguage
  }).sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title)
    } else {
      // Sort by ID (which contains timestamp) - newer first
      return b.id.localeCompare(a.id)
    }
  })

  // Get unique keys for filter
  const uniqueKeys = Array.from(new Set(songs.map(s => s.default_key))).sort()

  // Transform songs for the table component
  const transformedSongs = filteredSongs.map(song => {
    // Get full song data to access all worship leaders
    const fullSongData = SongsService.getSongById(song.id)
    return {
      id: song.id,
      title: song.title,
      key: song.default_key,
      worshipLeader: song.primary_worship_leader?.display_name || 'Unassigned',
      songType: song.song_type || 'Slow',
      language: song.language || 'English',
      category: song.category || 'Contemporary',
      worshipLeaders: fullSongData?.worshipLeaders || []
    }
  })

  const handleEditSong = async (song: any) => {
    try {
      // Fetch complete song data from JSON
      const fullSongData = SongsService.getSongById(song.id)

      if (fullSongData) {
        // Convert song to editor format
        const editorSong = {
          id: fullSongData.id,
          title: fullSongData.title,
          originalKey: fullSongData.originalKey,
          currentKey: fullSongData.defaultKey,
          worshipLeader: song.worshipLeader,
          category: fullSongData.tags[0] || '',
          songType: fullSongData.tags.includes('slow') ? 'Slow' : 'Upbeat',
          language: fullSongData.tags.includes('tagalog') ? 'Tagalog' : 'English',
          sections: fullSongData.sections.map((section: any) => ({
            id: section.id,
            type: section.name,
            label: section.name,
            content: section.snippet || '',
            chords: section.chords || ''
          })),
          notes: fullSongData.sections.map(s => s.notes).filter(Boolean).join('\n') || ''
        }
        setEditingSong(editorSong)
        setShowEditor(true)
      }
    } catch (error) {
      console.error('Error loading song for editing:', error)
    }
  }

  const handleAddNewSong = () => {
    const newSong = {
      id: `song_${Date.now()}`,
      title: 'New Song',
      originalKey: 'C',
      currentKey: 'C',
      worshipLeader: 'Unassigned',
      category: 'Contemporary',
      songType: 'Slow',
      language: 'English',
      sections: [],
      notes: ''
    }
    setEditingSong(newSong)
    setShowEditor(true)
  }

  const handleSaveSong = async (songData: any) => {
    // Read-only mode - just close the editor
    alert('This app is in read-only mode. To save changes permanently, edit data/songs.json file manually.\n\nTip: Use the song detail page (/songs/[id]) for a better editing experience!')
    setShowEditor(false)
    setEditingSong(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Songs Dashboard</h2>

          <div className="space-y-3">
            {/* Search - Full Width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
              />
            </div>

            {/* Filters Row - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'date')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm"
              >
                <option value="alphabetical">A-Z</option>
                <option value="date">Newest First</option>
              </select>

              {/* Key Filter */}
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm"
              >
                <option value="all">All Keys</option>
                {uniqueKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>

              {/* Worship Leader Filter */}
              <select
                value={selectedLeader}
                onChange={(e) => setSelectedLeader(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm"
              >
                <option value="all">All Leaders</option>
                {worshipLeaders.map(leader => (
                  <option key={leader.display_name} value={leader.display_name}>
                    {leader.display_name}
                  </option>
                ))}
              </select>

              {/* Song Type Filter */}
              <select
                value={selectedSongType}
                onChange={(e) => setSelectedSongType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm"
              >
                <option value="all">All Types</option>
                <option value="Slow">Slow</option>
                <option value="Upbeat">Upbeat</option>
                <option value="Medium">Medium</option>
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm"
              >
                <option value="all">All Languages</option>
                <option value="English">English</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Mixed">Mixed</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden col-span-2 sm:col-span-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 text-sm min-h-[44px] ${
                    viewMode === 'table'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm min-h-[44px] ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Songs</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{loading ? '...' : songs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Worship Leaders</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{loading ? '...' : worshipLeaders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Filtered Results</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{loading ? '...' : filteredSongs.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Loading songs...</h3>
          </div>
        ) : viewMode === 'table' ? (
          <SongTable songs={transformedSongs} onEditSong={handleEditSong} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformedSongs.map(song => (
              <SongCard key={song.id} song={song} onEditSong={handleEditSong} />
            ))}
          </div>
        )}

        {!loading && filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No songs found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>

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