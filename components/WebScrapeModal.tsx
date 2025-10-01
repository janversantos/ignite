'use client'

import { useState } from 'react'
import { Search, Link, Download, X, AlertCircle, CheckCircle } from 'lucide-react'

interface WebScrapeModalProps {
  isOpen: boolean
  onClose: () => void
  onSongDataReceived: (data: any) => void
}

interface ScrapeResult {
  title: string
  artist?: string
  url: string
  source: string
  key?: string
  hasChords: boolean
  confidence: number
}

export function WebScrapeModal({ isOpen, onClose, onSongDataReceived }: WebScrapeModalProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'url'>('search')
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<ScrapeResult[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleSearch = async () => {
    if (!songTitle.trim()) {
      setError('Please enter a song title')
      return
    }

    setIsLoading(true)
    setError('')
    setSearchResults([])

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songTitle: songTitle.trim(),
          artist: artist.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data.results || [])
      if (data.results?.length === 0) {
        setError('No results found. Try different keywords or use direct URL.')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    try {
      new URL(url) // Validate URL format
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape URL')
      }

      // Here you would process the scraped content
      // For demo, we'll show success message
      setSuccess('Content scraped successfully! (Feature in development)')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResult = async (result: ScrapeResult) => {
    setIsLoading(true)
    setError('')

    try {
      // In a real implementation, this would scrape the selected URL
      // For demo, we'll return mock data
      const mockSongData = {
        title: result.title,
        artist: result.artist,
        key: result.key,
        source: result.source,
        url: result.url,
        chordSections: [
          {
            section: 'Verse 1',
            chords: 'G - D - Em - C',
            lyrics: 'Sample verse lyrics...'
          },
          {
            section: 'Chorus',
            chords: 'C - G - Am - F',
            lyrics: 'Sample chorus lyrics...'
          }
        ],
        lyrics: `Verse 1:\nSample verse lyrics for ${result.title}\n\nChorus:\nSample chorus lyrics\n\nVerse 2:\nAnother verse`
      }

      onSongDataReceived(mockSongData)
      setSuccess('Song data imported successfully!')

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import song data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Song from Web
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'search'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search by Title
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'url'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            Direct URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Enter song title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist (optional)
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading || !songTitle.trim()}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Search for Song'}
              </button>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Search Results:</h3>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          {result.artist && (
                            <p className="text-sm text-gray-600">by {result.artist}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Source: {result.source}
                            {result.key && ` • Key: ${result.key}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.hasChords && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Has Chords
                            </span>
                          )}
                          <Download className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/song-chords"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports: Ultimate Guitar, Chordie, Chordify, and other chord websites
                </p>
              </div>

              <button
                onClick={handleUrlScrape}
                disabled={isLoading || !url.trim()}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Scraping...' : 'Import from URL'}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}