'use client'

import { useState } from 'react'
import { ArrowRight, RotateCcw, Copy, Check, Hash } from 'lucide-react'
import { transposeChordProgression, getAllKeys } from '@/utils/chordTransposer'
import { NashvilleConverter } from '@/lib/nashvilleConverter'

export function ChordTransposer() {
  const [originalKey, setOriginalKey] = useState('C')
  const [targetKey, setTargetKey] = useState('D')
  const [chordProgression, setChordProgression] = useState('C - F - G - C')
  const [transposedProgression, setTransposedProgression] = useState('')
  const [copied, setCopied] = useState(false)
  const [showNashville, setShowNashville] = useState(false)

  const keys = getAllKeys()

  const handleTranspose = () => {
    if (!chordProgression.trim()) return

    const steps = keys.indexOf(targetKey as any) - keys.indexOf(originalKey as any)
    const adjustedSteps = steps > 6 ? steps - 12 : steps < -6 ? steps + 12 : steps

    const transposed = transposeChordProgression(chordProgression, adjustedSteps)
    setTransposedProgression(transposed)
  }

  const handleCopy = async () => {
    if (!transposedProgression) return

    try {
      await navigator.clipboard.writeText(transposedProgression)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
    }
  }

  const handleReset = () => {
    setChordProgression('')
    setTransposedProgression('')
    setOriginalKey('C')
    setTargetKey('D')
  }

  const getDisplayProgression = (progression: string, key: string) => {
    if (!progression) return progression

    if (showNashville) {
      // Convert chords to Nashville numbers
      return NashvilleConverter.chordsToNashville(progression, key)
    } else {
      // If the progression contains Nashville numbers, convert to chords
      if (NashvilleConverter.containsNashvilleNumbers(progression)) {
        return NashvilleConverter.autoConvertInContent(progression, key)
      }
      return progression
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chord Transposer
          </h3>
        </div>

        {/* Nashville/Chord Toggle */}
        <button
          onClick={() => setShowNashville(!showNashville)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showNashville
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          <Hash className="w-3 h-3" />
          {showNashville ? 'Numbers' : 'Chords'}
        </button>
      </div>

      {/* Key Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Key
          </label>
          <select
            value={originalKey}
            onChange={(e) => setOriginalKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {keys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center">
          <div className="p-3 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-full">
            <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To Key
          </label>
          <select
            value={targetKey}
            onChange={(e) => setTargetKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {keys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chord Progression Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chord Progression
        </label>
        <textarea
          value={getDisplayProgression(chordProgression, originalKey)}
          onChange={(e) => {
            // Store the raw input, but allow the display to be converted
            let rawValue = e.target.value
            if (showNashville && !NashvilleConverter.containsNashvilleNumbers(rawValue)) {
              // If in Nashville mode and user types chords, convert them to numbers
              rawValue = NashvilleConverter.chordsToNashville(rawValue, originalKey)
            }
            setChordProgression(rawValue)
          }}
          placeholder={showNashville ? "Enter numbers (e.g., 1 - 4 - 5 - 1)" : "Enter chords (e.g., C - F - G - C)"}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          rows={3}
        />
      </div>

      {/* Transpose Button */}
      <button
        onClick={handleTranspose}
        disabled={!chordProgression.trim()}
        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        Transpose Chords
      </button>

      {/* Result */}
      {transposedProgression && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transposed Result
          </label>
          <div className="relative">
            <textarea
              value={getDisplayProgression(transposedProgression, targetKey)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 font-mono text-gray-900 dark:text-white"
              rows={3}
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Examples</h4>
        <div className="space-y-2">
          {(showNashville ? [
            '1 - 4 - 5 - 1',
            '6m - 4 - 1 - 5',
            'I - V - vi - IV',
            '1 - 5 - 6m - 4'
          ] : [
            'C - F - G - C',
            'Am - F - C - G',
            'G - D - Em - C',
            'D - A - Bm - G'
          ]).map((example, index) => (
            <button
              key={index}
              onClick={() => setChordProgression(example)}
              className="text-left text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 block w-full p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-mono"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full mt-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </div>
  )
}