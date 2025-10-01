import { MusicalKey, KeyChange, ChordTransposition } from '@/types'

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_EQUIVALENTS: { [key: string]: string } = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
}

export function getKeyIndex(key: string): number {
  const normalizedKey = key.replace('b', '#').charAt(0) + (key.includes('#') || key.includes('b') ? '#' : '')
  const index = CHROMATIC_SCALE.indexOf(normalizedKey)
  return index === -1 ? 0 : index
}

export function transposeKey(originalKey: string, steps: number): string {
  const keyIndex = getKeyIndex(originalKey)
  const newIndex = (keyIndex + steps + 12) % 12
  return CHROMATIC_SCALE[newIndex]
}

export function calculateTransposeSteps(fromKey: string, toKey: string): number {
  const fromIndex = getKeyIndex(fromKey)
  const toIndex = getKeyIndex(toKey)
  let steps = toIndex - fromIndex

  if (steps > 6) steps -= 12
  if (steps < -6) steps += 12

  return steps
}

export function transposeChord(chord: string, steps: number): string {
  if (!chord || steps === 0) return chord

  const chordRegex = /^([A-G][#b]?)(.*)$/
  const match = chord.match(chordRegex)

  if (!match) return chord

  const [, rootNote, suffix] = match
  const transposedRoot = transposeKey(rootNote, steps)

  return transposedRoot + suffix
}

export function transposeChordProgression(progression: string, steps: number): string {
  if (!progression || steps === 0) return progression

  const chordPattern = /([A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add|\d)*)/g

  return progression.replace(chordPattern, (chord) => {
    return transposeChord(chord.trim(), steps)
  })
}

export function getKeyTransposition(originalKey: string, newKey: string): KeyChange {
  const steps = calculateTransposeSteps(originalKey, newKey)
  return {
    originalKey,
    newKey,
    transposeSteps: steps
  }
}

export function getAllKeys(): MusicalKey[] {
  return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as MusicalKey[]
}

export function getEnharmonicEquivalent(key: string): string {
  return FLAT_EQUIVALENTS[key] || key
}