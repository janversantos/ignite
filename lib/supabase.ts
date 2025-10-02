import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  })
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Helper functions for common database operations
export class SupabaseService {
  static async getSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        primary_worship_leader:worship_leaders(*),
        chord_sections(*),
        worship_leader_songs(
          preferred_key,
          worship_leader:worship_leaders(name, display_name)
        )
      `)
      .eq('is_active', true)
      .order('title')

    if (error) throw error
    return data
  }

  static async getWorshipLeaders() {
    const { data, error } = await supabase
      .from('worship_leaders')
      .select(`
        *,
        worship_leader_songs(
          preferred_key,
          song:songs(title, original_key)
        )
      `)
      .eq('is_active', true)
      .order('display_name')

    if (error) throw error
    return data
  }

  static async getSongById(id: string) {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        primary_worship_leader:worship_leaders(*),
        chord_sections(*),
        worship_leader_songs(
          preferred_key,
          worship_leader:worship_leaders(name, display_name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createSong(song: Partial<Database['public']['Tables']['songs']['Insert']>) {
    const { data, error } = await supabase
      .from('songs')
      .insert(song)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateSong(id: string, updates: Partial<Database['public']['Tables']['songs']['Update']>) {
    console.log('Updating song with ID:', id, 'Updates:', updates)

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.email || 'Not authenticated')

    const { data, error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error(`Song with ID ${id} not found or could not be updated`)
    }

    return data[0] // Return the first (and should be only) updated record
  }

  static async createChordSection(chordSection: any) {
    console.log('Creating chord section:', chordSection)

    // Map our internal structure to database schema
    const dbChordSection: Database['public']['Tables']['chord_sections']['Insert'] = {
      song_id: chordSection.song_id,
      section_name: chordSection.section_type || chordSection.section_label || 'Untitled',
      section_order: chordSection.section_order || 0,
      chord_progression: chordSection.chords || chordSection.content || '',
      lyrics: chordSection.content || null,
      key: chordSection.key || 'C', // Default key if not provided
      notes: chordSection.notes || null
    }

    const { data, error } = await supabase
      .from('chord_sections')
      .insert(dbChordSection)
      .select()
      .single()

    if (error) {
      console.error('Chord section creation error:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        originalData: chordSection,
        dbMappedData: dbChordSection
      })
      throw error
    }
    return data
  }

  static async updateChordSection(id: string, updates: any) {
    console.log('Updating chord section:', { id, updates })

    // Map our internal structure to database schema
    const dbUpdates: Partial<Database['public']['Tables']['chord_sections']['Update']> = {}

    if (updates.section_type || updates.section_label) {
      dbUpdates.section_name = updates.section_type || updates.section_label
    }
    if (updates.section_order !== undefined) {
      dbUpdates.section_order = updates.section_order
    }
    if (updates.chords || updates.content) {
      dbUpdates.chord_progression = updates.chords || updates.content
    }
    if (updates.content !== undefined) {
      dbUpdates.lyrics = updates.content
    }
    if (updates.key) {
      dbUpdates.key = updates.key
    }
    if (updates.notes !== undefined) {
      dbUpdates.notes = updates.notes
    }

    const { data, error } = await supabase
      .from('chord_sections')
      .update(dbUpdates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Chord section update error:', {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        sectionId: id,
        originalUpdates: updates,
        dbMappedUpdates: dbUpdates
      })
      throw error
    }

    // Check if no rows were updated (section doesn't exist)
    if (!data || data.length === 0) {
      const noRowsError = new Error('No rows updated - section not found')
      ;(noRowsError as any).code = 'PGRST116'
      throw noRowsError
    }

    return data[0]
  }

  static async addWorshipLeaderSong(
    worshipLeaderId: string,
    songId: string,
    preferredKey: string
  ) {
    const { data, error } = await supabase
      .from('worship_leader_songs')
      .upsert({
        worship_leader_id: worshipLeaderId,
        song_id: songId,
        preferred_key: preferredKey
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async searchSongs(query: string) {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        primary_worship_leader:worship_leaders(name, display_name)
      `)
      .ilike('title', `%${query}%`)
      .eq('is_active', true)
      .order('title')

    if (error) throw error
    return data
  }

  // ========================================
  // SERVICE MANAGEMENT (Phase 1 - Hybrid)
  // ========================================

  static async getServices() {
    const { data, error} = await supabase
      .from('services')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return data
  }

  static async getServiceById(id: string) {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (serviceError) throw serviceError

    const { data: songs, error: songsError } = await supabase
      .from('service_songs')
      .select('*')
      .eq('service_id', id)
      .order('order_index', { ascending: true })

    if (songsError) throw songsError

    return {
      ...service,
      songs: songs || []
    }
  }

  static async createService(service: {
    title: string
    date: string
    time?: string
    description?: string
    worship_leader?: string
  }) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateService(id: string, updates: {
    title?: string
    date?: string
    time?: string
    description?: string
    worship_leader?: string
  }) {
    const { data, error } = await supabase
      .from('services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async addSongToService(serviceSong: {
    service_id: string
    song_id: string
    order_index: number
    key?: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('service_songs')
      .insert(serviceSong)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async removeSongFromService(id: string) {
    const { error } = await supabase
      .from('service_songs')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async updateServiceSong(id: string, updates: {
    order_index?: number
    key?: string
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('service_songs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async reorderServiceSongs(songs: { id: string; order_index: number }[]) {
    const promises = songs.map(song =>
      supabase
        .from('service_songs')
        .update({ order_index: song.order_index })
        .eq('id', song.id)
    )

    const results = await Promise.all(promises)

    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }
  }

  // ========================================
  // TEAM MEMBERS MANAGEMENT
  // ========================================

  static async getTeamMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  }

  static async getServiceMembers(serviceId: string) {
    const { data, error } = await supabase
      .from('service_members')
      .select(`
        *,
        member:team_members(*)
      `)
      .eq('service_id', serviceId)
      .order('created_at')

    if (error) throw error
    return data
  }

  static async addMemberToService(serviceMember: {
    service_id: string
    member_id: string
    roles: string[]
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('service_members')
      .insert(serviceMember)
      .select(`
        *,
        member:team_members(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async updateServiceMember(id: string, updates: {
    roles?: string[]
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('service_members')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        member:team_members(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async removeMemberFromService(id: string) {
    const { error } = await supabase
      .from('service_members')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}