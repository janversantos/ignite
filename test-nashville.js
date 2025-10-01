// Test script for Nashville Number System conversion
// Run this with: node test-nashville.js

class NashvilleConverter {
  // Major scale intervals for each key
  static MAJOR_SCALES = {
    'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  }

  // Roman numeral to number mapping
  static ROMAN_TO_NUMBER = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7
  }

  static parseNashvilleNumber(notation) {
    const cleanNotation = notation.trim()
    const numberMatch = cleanNotation.match(/^(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i|[1-7])(.*)$/)
    if (!numberMatch) return null

    const [, numberPart, modifierPart] = numberMatch
    const number = this.ROMAN_TO_NUMBER[numberPart]
    if (!number) return null

    const bassMatch = modifierPart.match(/(.*)\/([IVX]+|[1-7]|[A-G][#b]?)$/)
    let modifier = modifierPart
    let bass

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

  static numberToChord(nashvilleNumber, key) {
    const scale = this.MAJOR_SCALES[key]
    if (!scale) throw new Error(`Unknown key: ${key}`)

    const chordIndex = parseInt(nashvilleNumber.number) - 1
    if (chordIndex < 0 || chordIndex >= scale.length) {
      throw new Error(`Invalid chord number: ${nashvilleNumber.number}`)
    }

    let baseChord = scale[chordIndex]

    if (nashvilleNumber.modifier) {
      baseChord = baseChord.replace(/[md].*$/, '')
    }

    let finalChord = baseChord
    if (nashvilleNumber.modifier) {
      finalChord += nashvilleNumber.modifier
    }

    if (nashvilleNumber.bass) {
      let bassNote = nashvilleNumber.bass
      if (this.ROMAN_TO_NUMBER[nashvilleNumber.bass]) {
        const bassIndex = this.ROMAN_TO_NUMBER[nashvilleNumber.bass] - 1
        bassNote = scale[bassIndex].replace(/[md].*$/, '')
      }
      finalChord += `/${bassNote}`
    }

    return finalChord
  }

  static convertString(nashvilleString, key) {
    const parts = nashvilleString.split(/[\s\-|]+/).filter(part => part.trim())

    const convertedChords = parts.map(part => {
      const nashvilleNumber = this.parseNashvilleNumber(part)
      if (!nashvilleNumber) return part

      try {
        return this.numberToChord(nashvilleNumber, key)
      } catch {
        return part
      }
    })

    return convertedChords.join(' - ')
  }

  static containsNashvilleNumbers(text) {
    const nashvillePattern = /\b(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i|[1-7])([md]?[0-9]*)(\/([IVX]+|[1-7]|[A-G][#b]?))?\b/g
    return nashvillePattern.test(text)
  }
}

// Test cases
console.log('=== Nashville Number System Converter Tests ===\n')

// Test 1: Basic number conversion in D major
console.log('Test 1: Basic conversion in D major')
console.log('Input: "1 - 4 - 5 - 1"')
console.log('Output:', NashvilleConverter.convertString('1 - 4 - 5 - 1', 'D'))
console.log('Expected: D - G - A - D\n')

// Test 2: Roman numerals in G major
console.log('Test 2: Roman numerals in G major')
console.log('Input: "I - IV - V - vi"')
console.log('Output:', NashvilleConverter.convertString('I - IV - V - vi', 'G'))
console.log('Expected: G - C - D - Em\n')

// Test 3: Mixed notation (Give Me Jesus style)
console.log('Test 3: Give Me Jesus style (numbers in D)')
console.log('Input: "1 2 3 4 5 6"')
console.log('Output:', NashvilleConverter.convertString('1 2 3 4 5 6', 'D'))
console.log('Expected: D Em F#m G A Bm\n')

// Test 4: Detection test
console.log('Test 4: Detection test')
console.log('Contains numbers? "1 - 4 - 5":', NashvilleConverter.containsNashvilleNumbers('1 - 4 - 5'))
console.log('Contains numbers? "C - F - G":', NashvilleConverter.containsNashvilleNumbers('C - F - G'))
console.log()

// Test 5: Complex progression
console.log('Test 5: Complex progression in C')
console.log('Input: "1 - 6m - 4 - 5"')
console.log('Output:', NashvilleConverter.convertString('1 - 6m - 4 - 5', 'C'))
console.log('Expected: C - Am - F - G\n')

console.log('=== All tests completed ===')