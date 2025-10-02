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
  let suffix = chordMatch[2]

  // Check if there's a slash chord (e.g., "G/Bm")
  let bassNote = ''
  let bassSuffix = ''
  if (suffix.includes('/')) {
    const slashParts = suffix.split('/')
    suffix = slashParts[0] // Chord quality before slash
    const bassChord = slashParts[1] // Bass note after slash

    // Parse the bass note
    const bassMatch = bassChord.match(/^([A-G][#b]?)(.*)$/)
    if (bassMatch) {
      bassNote = bassMatch[1]
      bassSuffix = bassMatch[2]
    }
  }

  // Convert flats to sharps for consistency
  if (rootNote in flatToSharp) {
    rootNote = flatToSharp[rootNote]
  }
  if (bassNote && bassNote in flatToSharp) {
    bassNote = flatToSharp[bassNote]
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

  // Helper function to convert note names in suffix
  const convertNotesInSuffix = (suf: string): string => {
    // Replace any note names (A-G with optional # or b) in the suffix with their numbers
    return suf.replace(/([A-G][#b]?)/g, (match) => {
      let noteToConvert = match
      if (noteToConvert in flatToSharp) {
        noteToConvert = flatToSharp[noteToConvert]
      }
      const noteIdx = notes.indexOf(noteToConvert)
      if (noteIdx === -1) return match

      let noteDegree = noteIdx - keyIndex
      if (noteDegree < 0) noteDegree += 12

      return degreeMap[noteDegree] || match
    })
  }

  // Determine if minor (lowercase in Nashville system)
  let finalNumber = numberNotation
  if (suffix.startsWith('m') && !suffix.startsWith('maj')) {
    // For minor chords, we typically use lowercase Roman numerals
    // but for simplicity, we'll add 'm' suffix
    finalNumber = numberNotation + 'm'
  } else if (suffix) {
    // Convert any note names in the suffix
    finalNumber = numberNotation + convertNotesInSuffix(suffix)
  }

  // Handle bass note conversion if present
  if (bassNote) {
    const bassIndex = notes.indexOf(bassNote)
    if (bassIndex !== -1) {
      let bassDegree = bassIndex - keyIndex
      if (bassDegree < 0) bassDegree += 12

      const bassNumberNotation = degreeMap[bassDegree] || '?'
      let finalBassNumber = bassNumberNotation

      // Check if bass note is minor
      if (bassSuffix.startsWith('m') && !bassSuffix.startsWith('maj')) {
        finalBassNumber = bassNumberNotation + 'm'
      } else if (bassSuffix) {
        // Convert any note names in the bass suffix
        finalBassNumber = bassNumberNotation + convertNotesInSuffix(bassSuffix)
      }

      finalNumber = finalNumber + '/' + finalBassNumber
    }
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