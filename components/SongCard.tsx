'use client'

import { useRouter } from 'next/navigation'
import { Music, User, Hash, Edit, ExternalLink } from 'lucide-react'

interface Song {
  id: string
  title: string
  key: string
  worshipLeader: string
  category: string
  songType?: string
  language?: string
  worshipLeaders?: Array<{ name: string; preferredKey: string }>
}

interface SongCardProps {
  song: Song
  onEditSong?: (song: Song) => void
}

export function SongCard({ song, onEditSong }: SongCardProps) {
  const router = useRouter()

  const getKeyColor = (key: string) => {
    const colorMap: { [key: string]: string } = {
      'C': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      'C#': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      'Db': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      'D': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      'D#': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      'Eb': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      'E': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      'F': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      'F#': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      'Gb': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      'G': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      'G#': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      'Ab': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      'A': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
      'A#': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
      'Bb': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
      'B': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    }
    return colorMap[key] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
  }

  const getSongTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'Slow': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Upbeat': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Fast': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const getLanguageColor = (language: string) => {
    const colorMap: { [key: string]: string } = {
      'English': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Tagalog': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Mixed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return colorMap[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div
      onClick={() => router.push(`/songs/${song.id}`)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors duration-200 flex-shrink-0">
            <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 truncate">
            {song.title}
          </h3>
        </div>
      </div>

      {/* Key */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border shadow-sm ${getKeyColor(song.key)}`}>
          Key: {song.key}
        </span>
      </div>

      {/* Worship Leaders */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Worship Leaders:</span>
        </div>
        {song.worshipLeaders && song.worshipLeaders.length > 0 ? (
          <div className="flex flex-wrap gap-2 pl-8">
            {song.worshipLeaders.map((wl, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800"
              >
                <span className="font-medium">{wl.name}</span>
                <span className="text-purple-500 dark:text-purple-400">({wl.preferredKey})</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium pl-8">{song.worshipLeader}</span>
        )}
      </div>

      {/* Song Type and Language */}
      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
        {song.songType && (
          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getSongTypeColor(song.songType)}`}>
            {song.songType}
          </span>
        )}
        {song.language && (
          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${getLanguageColor(song.language)}`}>
            {song.language}
          </span>
        )}
      </div>
    </div>
  )
}