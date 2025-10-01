// Convert chord to Nashville Number System notation
export function chordToNumber(chord: string, key: string): string {
  if (!chord || !key) return chord

  // Define the chromatic scale
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const flatToSharp: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  }

  // Parse chord (e.g., "C#m7", "Bb/D", "F")
  const chordMatch = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!chordMatch) return chord

  let rootNote = chordMatch[1]
  const suffix = chordMatch[2]

  // Convert flats to sharps for consistency
  if (rootNote in flatToSharp) {
    rootNote = flatToSharp[rootNote]
  }

  let keyNote = key
  if (keyNote in flatToSharp) {
    keyNote = flatToSharp[keyNote]
  }

  // Find the interval
  const rootIndex = notes.indexOf(rootNote)
  const keyIndex = notes.indexOf(keyNote)

  if (rootIndex === -1 || keyIndex === -1) return chord

  // Calculate scale degree
  let degree = rootIndex - keyIndex
  if (degree < 0) degree += 12

  // Map to scale degree (1-7)
  const degreeMap: { [key: number]: string } = {
    0: '1',   // Root
    1: '♭2',  // Minor second
    2: '2',   // Major second
    3: '♭3',  // Minor third
    4: '3',   // Major third
    5: '4',   // Perfect fourth
    6: '♭5',  // Diminished fifth
    7: '5',   // Perfect fifth
    8: '♭6',  // Minor sixth
    9: '6',   // Major sixth
    10: '♭7', // Minor seventh
    11: '7'   // Major seventh
  }

  const numberNotation = degreeMap[degree] || '?'

  // Determine if minor (lowercase in Nashville system)
  let finalNumber = numberNotation
  if (suffix.startsWith('m') && !suffix.startsWith('maj')) {
    // For minor chords, we typically use lowercase Roman numerals
    // but for simplicity, we'll add 'm' suffix
    finalNumber = numberNotation + 'm'
  } else if (suffix) {
    finalNumber = numberNotation + suffix
  }

  return finalNumber
}

export function chordProgressionToNumbers(chordLine: string, key: string): string {
  if (!chordLine || !key) return chordLine

  // Split by whitespace and convert each chord
  return chordLine.split(/\s+/).map(chord => {
    if (!chord.trim()) return ''
    return chordToNumber(chord.trim(), key)
  }).join('  ')
}