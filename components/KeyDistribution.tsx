'use client'

import { SongsService } from '@/lib/songsData'

export function KeyDistribution() {
  const songs = SongsService.getSongs()

  // Calculate key distribution
  const keyCounts: Record<string, number> = {}
  songs.forEach(song => {
    const key = song.originalKey || song.defaultKey || 'Unknown'
    keyCounts[key] = (keyCounts[key] || 0) + 1
  })

  // Sort by count descending
  const sortedKeys = Object.entries(keyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // Show top 8 keys

  const maxCount = Math.max(...sortedKeys.map(([, count]) => count))

  const keyColors: Record<string, string> = {
    'C': 'bg-red-500',
    'D': 'bg-orange-500',
    'E': 'bg-yellow-500',
    'F': 'bg-green-500',
    'G': 'bg-blue-500',
    'A': 'bg-indigo-500',
    'B': 'bg-purple-500',
  }

  const getKeyColor = (key: string) => {
    const baseKey = key.replace(/[#b]/g, '') // Remove sharps/flats
    return keyColors[baseKey] || 'bg-gray-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Distribution</h2>

      {sortedKeys.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No song data available
        </div>
      ) : (
        <div className="space-y-4">
          {sortedKeys.map(([key, count]) => {
            const percentage = (count / maxCount) * 100
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-12">
                    {key}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {count} {count === 1 ? 'song' : 'songs'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getKeyColor(key)} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Keys:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {Object.keys(keyCounts).length}
          </span>
        </div>
      </div>
    </div>
  )
}
