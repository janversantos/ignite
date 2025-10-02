'use client'

import { useState, useEffect } from 'react'
import { X, CheckSquare, Square } from 'lucide-react'
import { SupabaseService } from '@/lib/supabase'

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

interface EditTeamMemberModalProps {
  serviceMember: ServiceMember
  onClose: () => void
  onMemberUpdated: () => void
}

export function EditTeamMemberModal({ serviceMember, onClose, onMemberUpdated }: EditTeamMemberModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(serviceMember.roles)
  const [notes, setNotes] = useState(serviceMember.notes || '')
  const [updating, setUpdating] = useState(false)

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  const handleUpdateMember = async () => {
    if (selectedRoles.length === 0) return

    setUpdating(true)
    try {
      await SupabaseService.updateServiceMember(serviceMember.id, {
        roles: selectedRoles,
        notes: notes.trim() || undefined
      })

      onMemberUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating team member:', error)
      alert('Failed to update team member')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Team Member
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {serviceMember.member.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Select Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role(s) for this Service
            </label>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              {serviceMember.member.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleRole(skill)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary-500 dark:hover:border-primary-600 transition-colors text-left"
                >
                  {selectedRoles.includes(skill) ? (
                    <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-900 dark:text-white font-medium">
                    {skill}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Select one or more roles from {serviceMember.member.name}'s available skills
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes or instructions..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateMember}
              disabled={selectedRoles.length === 0 || updating}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
