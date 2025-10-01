'use client'

import { useState, useEffect } from 'react'
import { Music, TrendingUp } from 'lucide-react'
import { SongsService } from '@/lib/songsData'
import { useRouter } from 'next/navigation'

export function MostUsedSongs() {
  const songs = SongsService.getSongs()
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date'>('alphabetical')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sortedSongs = [...songs]
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      } else {
        return b.id.localeCompare(a.id) // Newer first
      }
    })
    .slice(0, 5)

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Popular Songs</h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Popular Songs</h2>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'date')}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="alphabetical">A-Z</option>
          <option value="date">Newest First</option>
        </select>
      </div>

      {sortedSongs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No songs available
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSongs.map((song, index) => {
            const leaderCount = song.worshipLeaderKeys?.length || 0
            return (
              <div
                key={song.id}
                onClick={() => router.push(`/songs/${song.id}`)}
                className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-500 dark:hover:border-primary-600"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {song.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Music className="w-3.5 h-3.5" />
                        <span>Key: {song.originalKey || song.defaultKey}</span>
                      </div>
                      {leaderCount > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                          {leaderCount} {leaderCount === 1 ? 'leader' : 'leaders'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.push('/songs')}
          className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          View All Songs →
        </button>
      </div>
    </div>
  )
}
