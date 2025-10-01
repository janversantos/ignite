interface ScrapedSongData {
  title: string
  artist?: string
  key?: string
  chords: string[]
  lyrics: string[]
  source: string
  url: string
}

interface ScrapeResult {
  success: boolean
  data?: ScrapedSongData
  error?: string
}

export class ChordLyricsScraper {
  private static extractBasicSongInfo(content: string, url: string): ScrapedSongData {
    // Basic HTML content parsing without AI
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    // Try to find title from common patterns
    let title = 'Unknown Title'
    const titlePatterns = [
      /title[^>]*>([^<]+)</i,
      /song[^>]*>([^<]+)</i,
      /<h1[^>]*>([^<]+)</i,
      /<h2[^>]*>([^<]+)</i
    ]

    for (const pattern of titlePatterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        title = match[1].trim()
        break
      }
    }

    // Extract potential chord lines (lines with chord patterns)
    const chordPattern = /\b[A-G][#b]?(maj|min|m|M|dim|aug|sus|add|\d)*\b/g
    const chords: string[] = []
    const lyrics: string[] = []

    for (const line of lines) {
      if (line.match(chordPattern) && line.length < 100) {
        // Likely a chord line
        chords.push(line)
      } else if (line.length > 10 && line.length < 200 && !line.includes('<') && !line.includes('{')) {
        // Likely lyrics
        lyrics.push(line)
      }
    }

    // Try to detect key from chord progressions
    const allChords = chords.join(' ').match(chordPattern) || []
    const chordCounts: { [key: string]: number } = {}
    allChords.forEach(chord => {
      const root = chord.match(/^[A-G][#b]?/)?.[0]
      if (root) {
        chordCounts[root] = (chordCounts[root] || 0) + 1
      }
    })

    const detectedKey = Object.keys(chordCounts).reduce((a, b) =>
      chordCounts[a] > (chordCounts[b] || 0) ? a : b, 'C'
    )

    return {
      title,
      key: detectedKey,
      chords: chords.slice(0, 10), // Limit to first 10 chord lines
      lyrics: lyrics.slice(0, 20), // Limit to first 20 lyric lines
      source: new URL(url).hostname,
      url
    }
  }

  static async scrapeFromWebsite(url: string): Promise<ScrapeResult> {
    try {
      // First, fetch the webpage content
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch webpage: ${response.statusText}`)
      }

      const { content } = await response.json()

      // Use basic parsing to extract song information
      const extractedData = this.extractBasicSongInfo(content, url)

      return {
        success: true,
        data: extractedData
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async searchForSong(songTitle: string, artist?: string): Promise<ScrapeResult[]> {
    const searchQuery = artist ? `${songTitle} ${artist} chords lyrics` : `${songTitle} chords lyrics`

    // Common chord/lyrics websites to search
    const sources = [
      `site:ultimate-guitar.com ${searchQuery}`,
      `site:chordu.com ${searchQuery}`,
      `site:chordify.net ${searchQuery}`,
      `site:azchords.com ${searchQuery}`,
      `site:worship-guitar.com ${searchQuery}`
    ]

    const results: ScrapeResult[] = []

    for (const source of sources.slice(0, 3)) { // Limit to first 3 sources
      try {
        // This would normally use a search API or web scraping
        // For now, we'll return a mock result
        const mockResult: ScrapeResult = {
          success: true,
          data: {
            title: songTitle,
            artist: artist,
            key: 'G',
            chords: ['G - D - Em - C', 'Am - F - C - G'],
            lyrics: [
              'Verse 1:',
              'Sample lyrics for ' + songTitle,
              '',
              'Chorus:',
              'Sample chorus lyrics'
            ],
            source: 'mock-source',
            url: 'https://example.com'
          }
        }
        results.push(mockResult)
        break // Return first successful result
      } catch (error) {
        console.error(`Error searching ${source}:`, error)
      }
    }

    return results
  }

  static parseChordSheet(chordSheetText: string): { chords: string[], lyrics: string[] } {
    const lines = chordSheetText.split('\n')
    const chords: string[] = []
    const lyrics: string[] = []

    let currentChordLine = ''
    let currentLyricLine = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check if line contains mainly chords (capital letters, #, b, numbers)
      const chordPattern = /^[A-G#b\d\s\-\/]*$/
      const hasChords = chordPattern.test(line) && line.length > 0 && /[A-G]/.test(line)

      if (hasChords && !line.toLowerCase().includes('verse') && !line.toLowerCase().includes('chorus')) {
        currentChordLine = line
      } else if (line.length > 0) {
        currentLyricLine = line

        if (currentChordLine) {
          chords.push(currentChordLine)
          lyrics.push(currentLyricLine)
          currentChordLine = ''
          currentLyricLine = ''
        } else {
          lyrics.push(line)
        }
      }
    }

    return { chords: chords.filter(c => c.length > 0), lyrics }
  }
}

// Utility function to clean and format chord progressions
export function formatChordProgression(chords: string): string {
  return chords
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/([A-G][#b]?)/g, '$1 ') // Add space after each chord
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .replace(/\s*-\s*/g, ' - ') // Normalize dashes
    .trim()
}

// Utility function to detect song key from chord progression
export function detectSongKey(chords: string[]): string {
  const chordPattern = /([A-G][#b]?)/g
  const allChords: string[] = []

  chords.forEach(chord => {
    const matches = chord.match(chordPattern)
    if (matches) {
      allChords.push(...matches)
    }
  })

  // Simple key detection based on most common chord
  const chordCounts: { [key: string]: number } = {}
  allChords.forEach(chord => {
    chordCounts[chord] = (chordCounts[chord] || 0) + 1
  })

  const mostCommonChord = Object.keys(chordCounts).reduce((a, b) =>
    chordCounts[a] > chordCounts[b] ? a : b
  )

  return mostCommonChord || 'C'
}