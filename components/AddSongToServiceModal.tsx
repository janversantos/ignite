'use client'

import { useState, useEffect } from 'react'
import { X, Search, Music } from 'lucide-react'
import { SongsService } from '@/lib/songsData'
import { SupabaseService } from '@/lib/supabase'

interface Song {
  id: string
  title: string
  originalKey?: string
  defaultKey?: string
  artist?: string
  songType?: string
  language?: string
}

interface AddSongToServiceModalProps {
  serviceId: string
  existingSongIds: string[]
  onClose: () => void
  onSongAdded: () => void
}

export function AddSongToServiceModal({ serviceId, existingSongIds, onClose, onSongAdded }: AddSongToServiceModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const songs = SongsService.getSongs()
    setAllSongs(songs)
    setFilteredSongs(songs)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSongs(allSongs)
    } else {
      const filtered = allSongs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSongs(filtered)
    }
  }, [searchTerm, allSongs])

  const handleAddSong = async (song: Song) => {
    setAdding(true)
    try {
      // Get the current max order_index
      const maxOrder = existingSongIds.length

      await SupabaseService.addSongToService({
        service_id: serviceId,
        song_id: song.id,
        order_index: maxOrder,
        key: song.originalKey || song.defaultKey
      })

      onSongAdded()
      onClose()
    } catch (error) {
      console.error('Error adding song:', error)
      alert('Failed to add song to service')
    } finally {
      setAdding(false)
    }
  }

  const isSongInService = (songId: string) => {
    return existingSongIds.includes(songId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Song to Service
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search songs by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No songs found matching your search' : 'No songs available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => {
                const alreadyInService = isSongInService(song.id)
                const displayKey = song.originalKey || song.defaultKey || 'Unknown'

                return (
                  <div
                    key={song.id}
                    className={`group flex items-center justify-between p-4 rounded-lg border transition-all ${
                      alreadyInService
                        ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-50'
                        : 'bg-white dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {song.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>Key: {displayKey}</span>
                        {song.artist && <span>• {song.artist}</span>}
                        {song.songType && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {song.songType}
                          </span>
                        )}
                        {song.language && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                            {song.language}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSong(song)}
                      disabled={alreadyInService || adding}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        alreadyInService
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {alreadyInService ? 'Added' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
