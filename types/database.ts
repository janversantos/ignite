export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      worship_leaders: {
        Row: {
          id: string
          name: string
          display_name: string
          email: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          id: string
          title: string
          original_key: string
          default_key: string
          primary_worship_leader_id: string | null
          lyrics: string | null
          song_structure: Json | null
          external_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          original_key: string
          default_key: string
          primary_worship_leader_id?: string | null
          lyrics?: string | null
          song_structure?: Json | null
          external_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          original_key?: string
          default_key?: string
          primary_worship_leader_id?: string | null
          lyrics?: string | null
          song_structure?: Json | null
          external_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_primary_worship_leader_id_fkey"
            columns: ["primary_worship_leader_id"]
            isOneToOne: false
            referencedRelation: "worship_leaders"
            referencedColumns: ["id"]
          }
        ]
      }
      chord_sections: {
        Row: {
          id: string
          song_id: string
          section_name: string
          section_order: number
          chord_progression: string
          lyrics: string | null
          notes: string | null
          key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          section_name: string
          section_order?: number
          chord_progression: string
          lyrics?: string | null
          notes?: string | null
          key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          section_name?: string
          section_order?: number
          chord_progression?: string
          lyrics?: string | null
          notes?: string | null
          key?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chord_sections_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      worship_leader_songs: {
        Row: {
          id: string
          worship_leader_id: string
          song_id: string
          preferred_key: string
          frequency_played: number
          last_played_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worship_leader_id: string
          song_id: string
          preferred_key: string
          frequency_played?: number
          last_played_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worship_leader_id?: string
          song_id?: string
          preferred_key?: string
          frequency_played?: number
          last_played_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_leader_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_leader_songs_worship_leader_id_fkey"
            columns: ["worship_leader_id"]
            isOneToOne: false
            referencedRelation: "worship_leaders"
            referencedColumns: ["id"]
          }
        ]
      }
      service_lineups: {
        Row: {
          id: string
          service_date: string
          service_type: string
          worship_leader_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_date: string
          service_type?: string
          worship_leader_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_date?: string
          service_type?: string
          worship_leader_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_lineups_worship_leader_id_fkey"
            columns: ["worship_leader_id"]
            isOneToOne: false
            referencedRelation: "worship_leaders"
            referencedColumns: ["id"]
          }
        ]
      }
      lineup_songs: {
        Row: {
          id: string
          lineup_id: string
          song_id: string | null
          song_order: number
          key_played: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lineup_id: string
          song_id?: string | null
          song_order: number
          key_played: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lineup_id?: string
          song_id?: string | null
          song_order?: number
          key_played?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lineup_songs_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "service_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineup_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      song_tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      song_tag_associations: {
        Row: {
          song_id: string
          tag_id: string
        }
        Insert: {
          song_id: string
          tag_id: string
        }
        Update: {
          song_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_tag_associations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_tag_associations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "song_tags"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}