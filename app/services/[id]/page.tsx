'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, Plus, Trash2, ChevronUp, ChevronDown, Music, Edit2 } from 'lucide-react'
import { SupabaseService } from '@/lib/supabase'
import { SongsService } from '@/lib/songsData'
import { AddSongToServiceModal } from '@/components/AddSongToServiceModal'

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
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [serviceSongs, setServiceSongs] = useState<ServiceSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSongModal, setShowAddSongModal] = useState(false)
  const [isEditingService, setIsEditingService] = useState(false)
  const [editedService, setEditedService] = useState<Service | null>(null)

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      const data = await SupabaseService.getServiceById(serviceId)
      setService(data)
      setServiceSongs(data.songs || [])
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

      {/* Songs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Setlist ({serviceSongs.length} {serviceSongs.length === 1 ? 'song' : 'songs'})
          </h2>
          <button
            onClick={() => setShowAddSongModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Song
          </button>
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
          <div className="space-y-2">
            {serviceSongs.map((serviceSong, index) => {
              const song = getSongDetails(serviceSong.song_id)
              if (!song) return null

              const displayKey = serviceSong.key || song.originalKey || song.defaultKey || 'Unknown'

              return (
                <div
                  key={serviceSong.id}
                  className="group flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Order Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Song Info - Clickable */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/songs/${song.id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {song.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>Key: {displayKey}</span>
                      {song.artist && <span>• {song.artist}</span>}
                      {serviceSong.notes && <span>• {serviceSong.notes}</span>}
                    </div>
                  </div>

                  {/* Actions - Always visible */}
                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                      disabled={index === serviceSongs.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Edit Key/Notes (TODO) */}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit key/notes"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSong(serviceSong.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
    </div>
  )
}
