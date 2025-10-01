'use client'

import { Music, Key, Users } from 'lucide-react'
import { SongsService } from '@/lib/songsData'

export function QuickStats() {
  const songs = SongsService.getSongs()

  // Calculate stats
  const totalSongs = songs.length

  // Most used key
  const keyCounts: Record<string, number> = {}
  songs.forEach(song => {
    const key = song.originalKey || song.defaultKey || 'Unknown'
    keyCounts[key] = (keyCounts[key] || 0) + 1
  })
  const mostUsedKey = Object.entries(keyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  // Count unique worship leaders
  const leaders = new Set<string>()
  songs.forEach(song => {
    if (song.worshipLeaders && Array.isArray(song.worshipLeaders)) {
      song.worshipLeaders.forEach(wl => leaders.add(wl.name))
    }
  })
  const totalLeaders = leaders.size

  const stats = [
    {
      label: 'Total Songs',
      value: totalSongs,
      icon: Music,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Most Used Key',
      value: mostUsedKey,
      icon: Key,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Worship Leaders',
      value: totalLeaders,
      icon: Users,
      color: 'bg-green-500',
      lightBg: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.lightBg} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
