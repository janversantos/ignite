'use client'

import { useState, useEffect } from 'react'
import { X, Users, CheckSquare, Square } from 'lucide-react'
import { SupabaseService } from '@/lib/supabase'

interface TeamMember {
  id: string
  name: string
  skills: string[]
  is_active: boolean
}

interface AddTeamMemberModalProps {
  serviceId: string
  existingMemberIds: string[]
  onClose: () => void
  onMemberAdded: () => void
}

export function AddTeamMemberModal({ serviceId, existingMemberIds, onClose, onMemberAdded }: AddTeamMemberModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  useEffect(() => {
    if (selectedMemberId) {
      const member = teamMembers.find(m => m.id === selectedMemberId)
      setSelectedMember(member || null)
      setSelectedRoles([])
    } else {
      setSelectedMember(null)
      setSelectedRoles([])
    }
  }, [selectedMemberId, teamMembers])

  const loadTeamMembers = async () => {
    try {
      const data = await SupabaseService.getTeamMembers()
      setTeamMembers(data)
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  const handleAddMember = async () => {
    if (!selectedMemberId || selectedRoles.length === 0) return

    setAdding(true)
    try {
      await SupabaseService.addMemberToService({
        service_id: serviceId,
        member_id: selectedMemberId,
        roles: selectedRoles,
        notes: notes.trim() || undefined
      })

      onMemberAdded()
      onClose()
    } catch (error) {
      console.error('Error adding team member:', error)
      alert('Failed to add team member to service')
    } finally {
      setAdding(false)
    }
  }

  const isMemberInService = (memberId: string) => {
    return existingMemberIds.includes(memberId)
  }

  const availableMembers = teamMembers.filter(m => !isMemberInService(m.id))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Team Member to Service
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading team members...</p>
            </div>
          ) : availableMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                All team members have been added to this service
              </p>
            </div>
          ) : (
            <>
              {/* Select Team Member */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Team Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a team member...</option>
                  {availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Roles */}
              {selectedMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Role(s) for this Service
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedMember.skills.map((skill) => (
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
                    Select one or more roles from {selectedMember.name}'s available skills
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedMember && (
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
              )}
            </>
          )}
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
              onClick={handleAddMember}
              disabled={!selectedMemberId || selectedRoles.length === 0 || adding}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add to Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
