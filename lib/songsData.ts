import songsJson from '@/data/songs.json'

export interface Song {
  id: string
  title: string
  artist: string
  ccli: string
  originalKey: string
  defaultKey: string
  isActive: boolean
  externalUrl: string | null
  tags: string[]
  structure: string[]
  sections: ChordSection[]
  worshipLeaders: SongWorshipLeader[]
  songType?: string
  language?: string
}

export interface ChordSection {
  id: string
  name: string
  order: number
  chords: string
  snippet: string
  notes: string | null
}

export interface SongWorshipLeader {
  name: string
  preferredKey: string
}

export interface WorshipLeader {
  id: string
  name: string
  displayName: string
  email: string | null
  phone: string | null
  isActive: boolean
}

export interface SongsData {
  songs: Song[]
  worshipLeaders?: WorshipLeader[]
  lastUpdated?: string
}

// Load songs from JSON file
const data: SongsData = songsJson as SongsData

// Helper functions for accessing song data
export class SongsService {
  static getSongs(): Song[] {
    return data.songs.filter(song => song.isActive !== false)
  }

  static getWorshipLeaders(): WorshipLeader[] {
    if (!data.worshipLeaders) {
      // Extract worship leaders from songs if not in data
      const leadersMap = new Map<string, WorshipLeader>()
      data.songs.forEach(song => {
        song.worshipLeaders?.forEach(wl => {
          if (!leadersMap.has(wl.name)) {
            leadersMap.set(wl.name, {
              id: wl.name.toLowerCase().replace(/\s+/g, '-'),
              name: wl.name,
              displayName: wl.name,
              email: null,
              phone: null,
              isActive: true
            })
          }
        })
      })
      return Array.from(leadersMap.values())
    }
    return data.worshipLeaders.filter(leader => leader.isActive)
  }

  static getSongById(id: string): Song | undefined {
    return data.songs.find(song => song.id === id && song.isActive !== false)
  }

  static searchSongs(query: string): Song[] {
    const lowerQuery = query.toLowerCase()
    return data.songs.filter(song =>
      song.isActive !== false && (
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist?.toLowerCase().includes(lowerQuery)
      )
    )
  }

  static getSongsByWorshipLeader(leaderName: string): Song[] {
    return data.songs.filter(song =>
      song.isActive !== false &&
      song.worshipLeaders?.some(wl => wl.name === leaderName)
    )
  }

  static getSongsByKey(key: string): Song[] {
    return data.songs.filter(song =>
      song.isActive !== false && song.defaultKey === key
    )
  }

  static getSongsByTag(tag: string): Song[] {
    return data.songs.filter(song =>
      song.isActive !== false && song.tags?.includes(tag)
    )
  }

  static getAllTags(): string[] {
    const tagSet = new Set<string>()
    data.songs.forEach(song => {
      song.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }
}