'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, Plus, Trash2, ChevronUp, ChevronDown, Music, Edit2, ChevronRight, Zap, Wind, Heart, Users } from 'lucide-react'
import { SupabaseService } from '@/lib/supabase'
import { SongsService } from '@/lib/songsData'
import { AddSongToServiceModal } from '@/components/AddSongToServiceModal'
import { AddTeamMemberModal } from '@/components/AddTeamMemberModal'
import { EditTeamMemberModal } from '@/components/EditTeamMemberModal'
import { PerformanceMode } from '@/components/PerformanceMode'
import { transposeChordProgression, getAllKeys } from '@/utils/chordTransposer'
import { chordProgressionToNumbers } from '@/utils/numberSystem'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

interface Service {
  id: string
  title: string
  date: string
  time?: string
  worship_leader?: string
  description?: string
}

interface ServiceSong {
  id: string
  song_id: string
  order_index: number
  key?: string
  notes?: string
}

interface Song {
  id: string
  title: string
  originalKey?: string
  defaultKey?: string
  artist?: string
  songType?: string  // "Upbeat", "Slow", "Moderate"
  language?: string  // "English", "Tagalog", etc.
  sections?: Array<{
    id: string
    name: string
    order: number
    chords: string
    snippet?: string
    notes?: string
  }>
  worshipLeaders?: Array<{
    name: string
    preferredKey: string
  }>
}

interface ServiceMember {
  id: string
  service_id: string
  member_id: string
  roles: string[]
  notes?: string
  member: {
    id: string
    name: string
    skills: string[]
  }
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [serviceSongs, setServiceSongs] = useState<ServiceSong[]>([])
  const [serviceMembers, setServiceMembers] = useState<ServiceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSongModal, setShowAddSongModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<ServiceMember | null>(null)
  const [isEditingService, setIsEditingService] = useState(false)
  const [showPerformanceMode, setShowPerformanceMode] = useState(false)
  const [editedService, setEditedService] = useState<Service | null>(null)
  const [expandedSongIds, setExpandedSongIds] = useState<Set<string>>(new Set())
  const [songKeys, setSongKeys] = useState<Record<string, string>>({}) // Track current key for each song
  const [transposedSongs, setTransposedSongs] = useState<Record<string, Song>>({}) // Track transposed song data

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      const data = await SupabaseService.getServiceById(serviceId)
      setService(data)
      const songs = data.songs || []
      setServiceSongs(songs)

      // Initialize song keys from database
      const initialKeys: Record<string, string> = {}
      songs.forEach((serviceSong: ServiceSong) => {
        if (serviceSong.key) {
          initialKeys[serviceSong.id] = serviceSong.key
        }
      })
      setSongKeys(initialKeys)

      // Load team members
      const members = await SupabaseService.getServiceMembers(serviceId)
      setServiceMembers(members)
    } catch (error) {
      console.error('Error loading service:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getSongDetails = (songId: string): Song | null => {
    const songs = SongsService.getSongs()
    return songs.find(s => s.id === songId) || null
  }

  const handleRemoveSong = async (serviceSongId: string) => {
    if (!confirm('Remove this song from the service?')) return

    try {
      await SupabaseService.removeSongFromService(serviceSongId)
      setServiceSongs(prev => prev.filter(s => s.id !== serviceSongId))
    } catch (error) {
      console.error('Error removing song:', error)
      alert('Failed to remove song')
    }
  }

  const handleRemoveMember = async (serviceMemberId: string) => {
    if (!confirm('Remove this team member from the service?')) return

    try {
      await SupabaseService.removeMemberFromService(serviceMemberId)
      setServiceMembers(prev => prev.filter(m => m.id !== serviceMemberId))
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Failed to remove team member')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newSongs = [...serviceSongs]
    ;[newSongs[index], newSongs[index - 1]] = [newSongs[index - 1], newSongs[index]]

    // Update order_index
    const updates = newSongs.map((song, idx) => ({
      id: song.id,
      order_index: idx
    }))

    try {
      await SupabaseService.reorderServiceSongs(updates)
      setServiceSongs(newSongs)
    } catch (error) {
      console.error('Error reordering songs:', error)
      alert('Failed to reorder songs')
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === serviceSongs.length - 1) return

    const newSongs = [...serviceSongs]
    ;[newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]]

    // Update order_index
    const updates = newSongs.map((song, idx) => ({
      id: song.id,
      order_index: idx
    }))

    try {
      await SupabaseService.reorderServiceSongs(updates)
      setServiceSongs(newSongs)
    } catch (error) {
      console.error('Error reordering songs:', error)
      alert('Failed to reorder songs')
    }
  }

  const handleEditService = () => {
    setEditedService({ ...service! })
    setIsEditingService(true)
  }

  const handleSaveService = async () => {
    if (!editedService) return
    try {
      // Only send the fields that exist in the services table
      const updates = {
        title: editedService.title,
        date: editedService.date,
        time: editedService.time,
        worship_leader: editedService.worship_leader,
        description: editedService.description
      }
      await SupabaseService.updateService(serviceId, updates)
      setService(editedService)
      setIsEditingService(false)
      alert('Service updated successfully')
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Failed to update service')
    }
  }

  const handleCancelEdit = () => {
    setEditedService(null)
    setIsEditingService(false)
  }

  const toggleSongExpanded = (songId: string) => {
    setExpandedSongIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }

  const getTempoIcon = (songType?: string) => {
    if (!songType) return null
    const typeLower = songType.toLowerCase()
    if (typeLower.includes('fast') || typeLower.includes('upbeat')) {
      return <Zap className="w-4 h-4 text-orange-500" title="Upbeat" />
    } else if (typeLower.includes('slow') || typeLower.includes('ballad')) {
      return <Heart className="w-4 h-4 text-blue-500" title="Slow" />
    } else {
      return <Wind className="w-4 h-4 text-green-500" title="Moderate" />
    }
  }

  const getChordProgression = (song: Song) => {
    if (!song.sections || song.sections.length === 0) return null

    // Extract chord progressions from sections (simplified view)
    return song.sections
      .filter(section => section.chords && section.chords.trim())
      .map(section => ({
        section: section.name,
        chords: section.chords
      }))
  }

  const getSemitonesDifference = (fromKey: string, toKey: string) => {
    const keys = getAllKeys()
    const steps = keys.indexOf(toKey as any) - keys.indexOf(fromKey as any)
    return steps > 6 ? steps - 12 : steps < -6 ? steps + 12 : steps
  }

  const transposeSongInService = async (serviceSongId: string, song: Song, newKey: string) => {
    // Always calculate steps from the ORIGINAL key, not current key
    const originalKey = song.defaultKey || song.originalKey || 'C'
    const steps = getSemitonesDifference(originalKey, newKey)

    if (steps === 0) {
      // Reset to original
      setSongKeys(prev => ({ ...prev, [serviceSongId]: originalKey }))
      setTransposedSongs(prev => {
        const updated = { ...prev }
        delete updated[serviceSongId]
        return updated
      })

      // Save to database
      try {
        await SupabaseService.updateServiceSong(serviceSongId, { key: originalKey })
      } catch (error) {
        console.error('Error saving key to database:', error)
      }
      return
    }

    // Update the current key
    setSongKeys(prev => ({ ...prev, [serviceSongId]: newKey }))

    // Transpose the song from original
    const transposedSong: Song = {
      ...song,
      sections: song.sections?.map(section => ({
        ...section,
        chords: transposeChordProgression(section.chords, steps)
      }))
    }

    setTransposedSongs(prev => ({ ...prev, [serviceSongId]: transposedSong }))

    // Save to database
    try {
      await SupabaseService.updateServiceSong(serviceSongId, { key: newKey })
    } catch (error) {
      console.error('Error saving key to database:', error)
    }
  }

  const transposeBySteps = (serviceSongId: string, song: Song, steps: number) => {
    const currentKey = songKeys[serviceSongId] || song.defaultKey || song.originalKey || 'C'
    const keys = getAllKeys()
    const currentIndex = keys.indexOf(currentKey as any)
    const newIndex = (currentIndex + steps + 12) % 12
    const newKey = keys[newIndex]
    transposeSongInService(serviceSongId, song, newKey)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 dark:text-gray-400">Loading service...</div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-gray-500 dark:text-gray-400">Service not found</div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 mb-6 rounded-xl overflow-hidden">
        <div className="px-6 py-6">
          {/* Back Button and Edit Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            {isEditingService ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveService}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditService}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Service</span>
              </button>
            )}
          </div>

          {/* Title */}
          {isEditingService ? (
            <input
              type="text"
              value={editedService?.title || ''}
              onChange={(e) => setEditedService({ ...editedService!, title: e.target.value })}
              className="text-3xl font-bold w-full px-3 py-2 border-2 border-primary-500 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {service.title}
            </h1>
          )}

          {/* Metadata */}
          {isEditingService ? (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={editedService?.date || ''}
                  onChange={(e) => setEditedService({ ...editedService!, date: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={editedService?.time || ''}
                  onChange={(e) => setEditedService({ ...editedService!, time: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Worship Leader</label>
                <input
                  type="text"
                  value={editedService?.worship_leader || ''}
                  onChange={(e) => setEditedService({ ...editedService!, worship_leader: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Worship leader name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editedService?.description || ''}
                  onChange={(e) => setEditedService({ ...editedService!, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Service description"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(service.date)}</span>
                </div>
                {service.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatTime(service.time)}</span>
                  </div>
                )}
                {service.worship_leader && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{service.worship_leader}</span>
                  </div>
                )}
              </div>

              {service.description && (
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Team Members Section - Option 2: Grouped by Role */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Team ({serviceMembers.length} {serviceMembers.length === 1 ? 'member' : 'members'})
          </h2>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {serviceMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No team members assigned yet</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group members by role */}
            {(() => {
              const groupedByRole = serviceMembers.reduce((acc, sm) => {
                sm.roles.forEach(role => {
                  if (!acc[role]) acc[role] = []
                  acc[role].push(sm)
                })
                return acc
              }, {} as Record<string, ServiceMember[]>)

              return Object.entries(groupedByRole).map(([role, members]) => (
                <div key={role} className="flex items-start gap-3">
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-md whitespace-nowrap">
                    {role}
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {members.map((sm) => (
                      <div key={sm.id} className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white font-medium">{sm.member.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMember(sm)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            title="Edit member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(sm.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </div>

      {/* Songs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Setlist ({serviceSongs.length} {serviceSongs.length === 1 ? 'song' : 'songs'})
          </h2>
          <div className="flex gap-2">
            {serviceSongs.length > 0 && (
              <button
                onClick={() => setShowPerformanceMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Music className="w-4 h-4" />
                Performance Mode
              </button>
            )}
            <button
              onClick={() => setShowAddSongModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Song
            </button>
          </div>
        </div>

        {serviceSongs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No songs added yet</p>
            <button
              onClick={() => setShowAddSongModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Song
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceSongs.map((serviceSong, index) => {
              const originalSong = getSongDetails(serviceSong.song_id)
              if (!originalSong) return null

              // Use transposed song if available, otherwise use original
              const song = transposedSongs[serviceSong.id] || originalSong
              const currentKey = songKeys[serviceSong.id] || serviceSong.key || originalSong.defaultKey || originalSong.originalKey || 'C'
              const displayKey = currentKey
              const isExpanded = expandedSongIds.has(serviceSong.id)
              const chordProgression = getChordProgression(song)

              return (
                <div
                  key={serviceSong.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  {/* Main Song Card */}
                  <div className="p-4 md:p-5">
                    {/* Header Row */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Order Number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </span>
                      </div>

                      {/* Song Title & Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2"
                          onClick={() => router.push(`/songs/${song.id}`)}
                        >
                          {song.title}
                        </h3>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {/* Key Badge */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-md font-semibold">
                            🎵 {displayKey}
                          </span>

                          {/* Tempo Badge */}
                          {song.songType && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">
                              {getTempoIcon(song.songType)}
                              <span>{song.songType}</span>
                            </span>
                          )}

                          {/* Language Badge */}
                          {song.language && (
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                              {song.language}
                            </span>
                          )}
                        </div>

                        {/* Artist */}
                        {song.artist && (
                          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                            • {song.artist}
                          </p>
                        )}

                        {/* Service Notes */}
                        {serviceSong.notes && (
                          <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm italic">
                            📌 {serviceSong.notes}
                          </p>
                        )}
                      </div>

                      {/* Reorder Buttons (Desktop) */}
                      <div className="hidden md:flex flex-col gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                          disabled={index === serviceSongs.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {/* Expand Chords Button */}
                      {chordProgression && chordProgression.length > 0 && (
                        <button
                          onClick={() => toggleSongExpanded(serviceSong.id)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors font-medium"
                        >
                          <Music className="w-4 h-4" />
                          {isExpanded ? 'Hide Chords' : 'Show Chords'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {/* Mobile Reorder Buttons */}
                      <div className="flex md:hidden gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                          disabled={index === 0}
                          className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          title="Move up"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                          disabled={index === serviceSongs.length - 1}
                          className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          title="Move down"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Edit & Delete Buttons */}
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors min-h-[44px]"
                          title="Edit key/notes"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSong(serviceSong.id); }}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors min-h-[44px]"
                          title="Remove song"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Chords Section */}
                  {isExpanded && chordProgression && (
                    <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
                      {/* Transpose Controls - Single Row */}
                      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {/* Worship Leader Buttons */}
                          {originalSong.worshipLeaders && originalSong.worshipLeaders.length > 0 && (
                            <>
                              {originalSong.worshipLeaders.map((wl: any, idx: number) => {
                                const isActive = currentKey === wl.preferredKey
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => transposeSongInService(serviceSong.id, originalSong, wl.preferredKey)}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                      isActive
                                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                                    }`}
                                  >
                                    {wl.name}-{wl.preferredKey}
                                  </button>
                                )
                              })}
                              <span className="text-gray-400 dark:text-gray-500 mx-1">|</span>
                            </>
                          )}

                          {/* Fine-tune buttons */}
                          <button
                            onClick={() => transposeBySteps(serviceSong.id, originalSong, -1)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors"
                          >
                            -1
                          </button>
                          <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-md font-semibold">
                            {currentKey}
                          </span>
                          <button
                            onClick={() => transposeBySteps(serviceSong.id, originalSong, 1)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors"
                          >
                            +1
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {chordProgression.map((section, idx) => {
                          const nashville = chordProgressionToNumbers(section.chords, currentKey)
                          return (
                            <div key={idx}>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {section.section}:
                              </h4>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                  {section.chords}
                                </p>
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                                  {nashville}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => router.push(`/songs/${song.id}`)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        View Full Song
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      {showAddSongModal && (
        <AddSongToServiceModal
          serviceId={serviceId}
          existingSongIds={serviceSongs.map(s => s.song_id)}
          onClose={() => setShowAddSongModal(false)}
          onSongAdded={loadService}
        />
      )}

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <AddTeamMemberModal
          serviceId={serviceId}
          existingMemberIds={serviceMembers.map(m => m.member_id)}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={loadService}
        />
      )}

      {/* Edit Team Member Modal */}
      {editingMember && (
        <EditTeamMemberModal
          serviceMember={editingMember}
          onClose={() => setEditingMember(null)}
          onMemberUpdated={loadService}
        />
      )}

      {/* Performance Mode */}
      {showPerformanceMode && (
        <PerformanceMode
          songs={serviceSongs.map(serviceSong => {
            const originalSong = getSongDetails(serviceSong.song_id)
            const song = transposedSongs[serviceSong.id] || originalSong
            const currentKey = songKeys[serviceSong.id] || serviceSong.key || originalSong?.defaultKey || originalSong?.originalKey || 'C'

            return {
              song: {
                ...(song || { id: '', title: 'Unknown', sections: [] }),
                worshipLeaders: originalSong?.worshipLeaders
              },
              key: currentKey,
              serviceSongId: serviceSong.id
            }
          })}
          onClose={() => setShowPerformanceMode(false)}
        />
      )}
    </div>
  )
}
