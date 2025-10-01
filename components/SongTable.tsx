'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Song {
  id: string
  title: string
  key: string
  worshipLeader: string
  category: string
  songType?: string
  language?: string
  lastUsed?: string
  frequency?: number
  worshipLeaders?: Array<{ name: string; preferredKey: string }>
}

interface SongTableProps {
  songs: Song[]
  selectedSongs?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onEditSong?: (song: Song) => void
}

type SortField = 'title' | 'key' | 'worshipLeader' | 'songType' | 'language'
type SortDirection = 'asc' | 'desc'

export function SongTable({ songs, selectedSongs = [], onSelectionChange, onEditSong }: SongTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedSongs = [...songs].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 text-primary-600 dark:text-primary-400" /> :
      <ChevronDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
  }

  const getKeyColor = (key: string) => {
    const colorMap: { [key: string]: string } = {
      'C': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      'C#': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      'Db': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      'D#': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      'Eb': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      'E': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      'F': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      'F#': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      'Gb': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      'G': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'G#': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'Ab': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'A': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      'A#': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      'Bb': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      'B': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    }
    return colorMap[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }

  const getSongTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'Slow': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      'Fast': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }

  const getLanguageColor = (language: string) => {
    const colorMap: { [key: string]: string } = {
      'English': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      'Tagalog': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      'Mixed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    }
    return colorMap[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {onSelectionChange && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedSongs.length === songs.length && songs.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange(songs.map(s => s.id))
                    } else {
                      onSelectionChange([])
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                />
              </th>
            )}
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-1">
                Song Title
                <SortIcon field="title" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => handleSort('key')}
            >
              <div className="flex items-center gap-1">
                Key
                <SortIcon field="key" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => handleSort('worshipLeader')}
            >
              <div className="flex items-center gap-1">
                Worship Leader
                <SortIcon field="worshipLeader" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => handleSort('songType')}
            >
              <div className="flex items-center gap-1">
                Song Type
                <SortIcon field="songType" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => handleSort('language')}
            >
              <div className="flex items-center gap-1">
                Language
                <SortIcon field="language" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedSongs.map((song) => {
            return (
              <tr key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                {onSelectionChange && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectionChange([...selectedSongs, song.id])
                        } else {
                          onSelectionChange(selectedSongs.filter(id => id !== song.id))
                        }
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                    />
                  </td>
                )}

                {/* Title */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => router.push(`/songs/${song.id}`)}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors hover:underline"
                  >
                    {song.title}
                  </button>
                </td>

                {/* Key */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 hover:scale-105 ${getKeyColor(song.key)}`}>
                    {song.key}
                  </span>
                </td>

                {/* Worship Leader(s) */}
                <td className="px-6 py-4">
                  {song.worshipLeaders && song.worshipLeaders.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {song.worshipLeaders.map((wl, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800"
                        >
                          <span className="font-medium">{wl.name}</span>
                          <span className="text-purple-500 dark:text-purple-400">({wl.preferredKey})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100">{song.worshipLeader}</div>
                  )}
                </td>

                {/* Song Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 hover:scale-105 ${getSongTypeColor(song.songType || 'Slow')}`}>
                    {song.songType || 'Slow'}
                  </span>
                </td>

                {/* Language */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 hover:scale-105 ${getLanguageColor(song.language || 'English')}`}>
                    {song.language || 'English'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}