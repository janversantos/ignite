// Nashville Number System to Chord Converter
// Converts number notation (1, 2, 3, etc.) to actual chord names based on key

export interface NashvilleNumber {
  number: string
  modifier?: string // m, 7, sus, etc.
  bass?: string // slash bass note
}

export class NashvilleConverter {
  // Major scale intervals for each key
  private static readonly MAJOR_SCALES: Record<string, string[]> = {
    'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    'C#': ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'],
    'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
    'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    'D#': ['D#', 'E#m', 'F##m', 'G#', 'A#', 'B#m', 'C##dim'],
    'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
    'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
    'Gb': ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'],
    'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    'G#': ['G#', 'A#m', 'B#m', 'C#', 'D#', 'E#m', 'F##dim'],
    'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
    'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    'A#': ['A#', 'B#m', 'C##m', 'D#', 'E#', 'F##m', 'G##dim'],
    'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
    'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim']
  }

  // Roman numeral to number mapping
  private static readonly ROMAN_TO_NUMBER: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7
  }

  /**
   * Parse a Nashville number notation
   */
  static parseNashvilleNumber(notation: string): NashvilleNumber | null {
    // Handle various formats: 1, 1m, 1sus, 1/3, IV, IVm7, etc.
    const cleanNotation = notation.trim()

    // Extract number/roman numeral
    const numberMatch = cleanNotation.match(/^(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i|[1-7])(.*)$/)
    if (!numberMatch) return null

    const [, numberPart, modifierPart] = numberMatch
    const number = this.ROMAN_TO_NUMBER[numberPart]
    if (!number) return null

    // Parse modifier (m, 7, sus, etc.) and bass note
    const bassMatch = modifierPart.match(/(.*)\/([IVX]+|[1-7]|[A-G][#b]?)$/)
    let modifier = modifierPart
    let bass: string | undefined

    if (bassMatch) {
      modifier = bassMatch[1]
      bass = bassMatch[2]
    }

    return {
      number: number.toString(),
      modifier: modifier || undefined,
      bass: bass || undefined
    }
  }

  /**
   * Convert Nashville number to chord name
   */
  static numberToChord(nashvilleNumber: NashvilleNumber, key: string): string {
    const scale = this.MAJOR_SCALES[key]
    if (!scale) throw new Error(`Unknown key: ${key}`)

    const chordIndex = parseInt(nashvilleNumber.number) - 1
    if (chordIndex < 0 || chordIndex >= scale.length) {
      throw new Error(`Invalid chord number: ${nashvilleNumber.number}`)
    }

    let baseChord = scale[chordIndex]

    // Remove default minor/diminished from scale if we have explicit modifiers
    if (nashvilleNumber.modifier) {
      // Get root note only
      baseChord = baseChord.replace(/[md].*$/, '')
    }

    // Apply modifier
    let finalChord = baseChord
    if (nashvilleNumber.modifier) {
      finalChord += nashvilleNumber.modifier
    }

    // Apply bass note
    if (nashvilleNumber.bass) {
      let bassNote = nashvilleNumber.bass

      // If bass is also a number, convert it
      if (this.ROMAN_TO_NUMBER[nashvilleNumber.bass]) {
        const bassIndex = this.ROMAN_TO_NUMBER[nashvilleNumber.bass] - 1
        bassNote = scale[bassIndex].replace(/[md].*$/, '')
      }

      finalChord += `/${bassNote}`
    }

    return finalChord
  }

  /**
   * Convert a string of Nashville numbers to chords
   */
  static convertString(nashvilleString: string, key: string): string {
    // Split by common delimiters and convert each part
    const parts = nashvilleString.split(/[\s\-|]+/).filter(part => part.trim())

    const convertedChords = parts.map(part => {
      const nashvilleNumber = this.parseNashvilleNumber(part)
      if (!nashvilleNumber) return part // Return as-is if not a valid number

      try {
        return this.numberToChord(nashvilleNumber, key)
      } catch {
        return part // Return as-is if conversion fails
      }
    })

    return convertedChords.join(' - ')
  }

  /**
   * Detect if a string contains Nashville numbers
   */
  static containsNashvilleNumbers(text: string): boolean {
    const nashvillePattern = /\b(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i|[1-7])([md]?[0-9]*)(\/([IVX]+|[1-7]|[A-G][#b]?))?\b/g
    return nashvillePattern.test(text)
  }

  /**
   * Get all available keys
   */
  static getAvailableKeys(): string[] {
    return Object.keys(this.MAJOR_SCALES)
  }

  /**
   * Auto-convert Nashville numbers in chord content
   */
  static autoConvertInContent(content: string, key: string): string {
    if (!this.containsNashvilleNumbers(content)) return content

    // Replace Nashville numbers while preserving other text
    return content.replace(/\b(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i|[1-7])([md]?[0-9]*)(\/([IVX]+|[1-7]|[A-G][#b]?))?\b/g, (match) => {
      const nashvilleNumber = this.parseNashvilleNumber(match)
      if (!nashvilleNumber) return match

      try {
        return this.numberToChord(nashvilleNumber, key)
      } catch {
        return match
      }
    })
  }

  /**
   * Convert chord names to Nashville numbers
   */
  static chordsToNashville(content: string, key: string): string {
    const scale = this.MAJOR_SCALES[key]
    if (!scale) return content

    // Create a mapping from chord names to numbers
    const chordToNumber: Record<string, string> = {}

    scale.forEach((chord, index) => {
      const number = (index + 1).toString()
      chordToNumber[chord] = number

      // Handle major versions (remove 'm' for minor chords)
      if (chord.endsWith('m')) {
        const majorChord = chord.slice(0, -1)
        chordToNumber[majorChord] = number
      }
    })

    // Replace chord names with numbers
    return content.replace(/\b([A-G][#b]?(?:m|maj|dim|aug)?(?:[0-9]+)?(?:sus[0-9]*)?)\b/g, (match) => {
      // Try exact match first
      if (chordToNumber[match]) {
        return chordToNumber[match] + (match.includes('m') && !match.includes('maj') ? 'm' : '')
      }

      // Try without modifiers
      const baseChord = match.replace(/[0-9]+|sus[0-9]*|maj|dim|aug/g, '')
      if (chordToNumber[baseChord]) {
        const number = chordToNumber[baseChord]
        const modifier = match.replace(baseChord, '')
        return number + (baseChord.includes('m') ? 'm' : '') + modifier
      }

      return match
    })
  }
}