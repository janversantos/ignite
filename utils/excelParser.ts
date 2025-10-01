import * as XLSX from 'xlsx'
import { Song, WorshipLeader, ChordSection, SongCompilation } from '@/types'

export interface ExcelData {
  songs: Song[]
  worshipLeaders: WorshipLeader[]
  songCompilation: SongCompilation[]
  chordSections: ChordSection[]
}

export function parseExcelFile(filePath: string): ExcelData {
  const workbook = XLSX.readFile(filePath)
  const result: ExcelData = {
    songs: [],
    worshipLeaders: [],
    songCompilation: [],
    chordSections: []
  }

  // Parse Song Compilation sheet (master list)
  if (workbook.SheetNames.includes('Song Compilation')) {
    const compilationSheet = workbook.Sheets['Song Compilation']
    const compilationData = XLSX.utils.sheet_to_json(compilationSheet, { header: 1 }) as string[][]

    for (let i = 1; i < compilationData.length; i++) {
      const row = compilationData[i]
      if (row[0] && row[1] && row[2]) {
        result.songCompilation.push({
          song: row[0],
          key: row[1],
          worshipLeader: row[2]
        })
      }
    }
  }

  // Parse Chord Viewer sheet
  if (workbook.SheetNames.includes('Chord Viewer')) {
    const chordSheet = workbook.Sheets['Chord Viewer']
    const chordData = XLSX.utils.sheet_to_json(chordSheet, { header: 1 }) as string[][]

    for (let i = 1; i < chordData.length; i++) {
      const row = chordData[i]
      if (row[0] && row[1]) {
        result.chordSections.push({
          id: `chord_${i}`,
          songId: row[0]?.toString() || '',
          section: row[1]?.toString() || '',
          chords: row[2]?.toString() || '',
          lyrics: row[3]?.toString() || '',
          notes: row[4]?.toString() || ''
        })
      }
    }
  }

  // Parse individual worship leader sheets
  const leaderSheets = workbook.SheetNames.filter(name =>
    !['Song Compilation', 'Chord Viewer', 'MARGAUX'].includes(name)
  )

  leaderSheets.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]

    const leader: WorshipLeader = {
      id: sheetName.toLowerCase().replace(/\s+/g, '_'),
      name: sheetName,
      displayName: sheetName,
      songs: [],
      preferredKeys: {}
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (row[0] && row[1]) {
        const song: Song = {
          id: `${leader.id}_${row[0]?.toString().toLowerCase().replace(/\s+/g, '_')}`,
          title: row[0].toString(),
          key: row[1].toString(),
          worshipLeader: sheetName
        }

        leader.songs.push(song)
        leader.preferredKeys[song.title] = song.key
      }
    }

    result.worshipLeaders.push(leader)
  })

  // Create consolidated songs list
  const songMap = new Map<string, Song>()

  result.songCompilation.forEach(comp => {
    const songId = comp.song.toLowerCase().replace(/\s+/g, '_')
    if (!songMap.has(songId)) {
      songMap.set(songId, {
        id: songId,
        title: comp.song,
        key: comp.key,
        worshipLeader: comp.worshipLeader,
        chords: result.chordSections.filter(cs => cs.songId === comp.song)
      })
    }
  })

  result.songs = Array.from(songMap.values())

  return result
}

export function convertExcelToJson(excelPath: string, outputPath?: string): ExcelData {
  const data = parseExcelFile(excelPath)

  if (outputPath) {
    const fs = require('fs')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  }

  return data
}