export interface Song {
  id: string
  title: string
  key: string
  worshipLeader: string
  chords?: ChordSection[]
  lyrics?: string
  originalKey?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ChordSection {
  id: string
  songId: string
  section: string // 'Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'
  chords: string
  lyrics?: string
  notes?: string
}

export interface WorshipLeader {
  id: string
  name: string
  displayName: string
  songs: Song[]
  preferredKeys: { [songTitle: string]: string }
}

export interface KeyChange {
  originalKey: string
  newKey: string
  transposeSteps: number
}

export interface ChordTransposition {
  originalChord: string
  transposedChord: string
}

export interface SongCompilation {
  song: string
  key: string
  worshipLeader: string
}

export interface DatabaseSchema {
  songs: Song[]
  worship_leaders: WorshipLeader[]
  chord_sections: ChordSection[]
}

export type MusicalKey = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

export interface ChordProgression {
  section: string
  progression: string[]
  lyrics?: string[]
}