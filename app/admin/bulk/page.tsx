'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminProtected } from '@/components/AdminProtected'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { SongsService } from '@/lib/songsData'
import {
  Search, Download, LogOut, Edit3, Trash2, Check, X, Music, Plus
} from 'lucide-react'

export default function AdminBulkPage() {
  return (
    <AdminProtected>
      <AdminBulkContent />
    </AdminProtected>
  )
}

function AdminBulkContent() {
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [songs, setSongs] = useState<any[]>([])
  const [filteredSongs, setFilteredSongs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    loadSongs()
  }, [])

  useEffect(() => {
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSongs(filtered)
  }, [searchTerm, songs])

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
    link.download = `songs-bulk-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    alert('Downloaded JSON file. (Auto-save only works on localhost)')
  }

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSongs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSongs.map(s => s.id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('Please select songs to delete')
      return
    }

    if (confirm(`Delete ${selectedIds.length} selected songs?`)) {
      setSongs(prev => prev.filter(s => !selectedIds.includes(s.id)))
      setSelectedIds([])
      alert('Songs deleted! Remember to download the JSON file.')
    }
  }

  const handleBulkChangeKey = () => {
    if (selectedIds.length === 0) {
      alert('Please select songs first')
      return
    }

    const newKey = prompt('Enter new key (C, D, E, F, G, A, B, etc.):')
    if (newKey) {
      setSongs(prev => prev.map(song =>
        selectedIds.includes(song.id) ? { ...song, originalKey: newKey, defaultKey: newKey } : song
      ))
      alert(`Updated ${selectedIds.length} songs! Remember to download the JSON file.`)
      setSelectedIds([])
    }
  }

  const handleInlineEdit = (id: string, field: string, value: string) => {
    setSongs(prev => prev.map(song =>
      song.id === id ? { ...song, [field]: value } : song
    ))
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
    alert('New song added! Remember to download the JSON when done.')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulk Editor
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${songs.length} songs total`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={addNewSong}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Song
              </button>
              <button
                onClick={() => router.push('/admin/songs')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Card View
              </button>
              <button
                onClick={handleDownloadJSON}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Save All
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

          {/* Search & Bulk Actions */}
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

            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkChangeKey}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  Change Key
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredSongs.length && filteredSongs.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Artist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Original Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Song Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Worship Leaders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Sections
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSongs.map(song => (
                  <tr
                    key={song.id}
                    className={`${
                      selectedIds.includes(song.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    } hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(song.id)}
                        onChange={() => toggleSelect(song.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={song.title}
                        onChange={(e) => handleInlineEdit(song.id, 'title', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded min-w-[150px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={song.artist || ''}
                        onChange={(e) => handleInlineEdit(song.id, 'artist', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded min-w-[120px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={song.originalKey || 'C'}
                        onChange={(e) => {
                          handleInlineEdit(song.id, 'originalKey', e.target.value)
                          handleInlineEdit(song.id, 'defaultKey', e.target.value)
                        }}
                        className="px-2 py-1 text-sm border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded"
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={song.songType || 'Slow'}
                        onChange={(e) => handleInlineEdit(song.id, 'songType', e.target.value)}
                        className="px-2 py-1 text-sm border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Slow">Slow</option>
                        <option value="Upbeat">Upbeat</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={song.language || 'English'}
                        onChange={(e) => handleInlineEdit(song.id, 'language', e.target.value)}
                        className="px-2 py-1 text-sm border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="English">English</option>
                        <option value="Tagalog">Tagalog</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">
                      {(song.worshipLeaders || []).map((leader: any) => leader.name).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {song.sections?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/songs/${song.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No songs found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search
            </p>
          </div>
        )}
      </main>
    </div>
  )
}