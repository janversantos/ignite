const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const XLSX = require('xlsx')
const { createClient } = require('@supabase/supabase-js')

// Configure Supabase (you'll need to set these environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateExcelData() {
  try {
    console.log('Starting Excel data migration...')

    // Read the Excel file
    const excelPath = path.join(__dirname, '../../LINE UP - KEYS.xlsx')
    const workbook = XLSX.readFile(excelPath)

    // Step 1: Create worship leaders
    console.log('\n1. Creating worship leaders...')
    const leaderSheets = workbook.SheetNames.filter(name =>
      !['Song Compilation', 'Chord Viewer'].includes(name)
    )

    const worshipLeaders = []
    for (const sheetName of leaderSheets) {
      const leader = {
        name: sheetName,
        display_name: sheetName,
        is_active: true
      }

      const { data, error } = await supabase
        .from('worship_leaders')
        .upsert(leader, { onConflict: 'name' })
        .select()
        .single()

      if (error) {
        console.error(`Error creating leader ${sheetName}:`, error)
      } else {
        worshipLeaders.push(data)
        console.log(`✓ Created/updated leader: ${sheetName}`)
      }
    }

    // Step 2: Process Song Compilation sheet
    console.log('\n2. Processing song compilation...')
    const compilationSheet = workbook.Sheets['Song Compilation']
    const compilationData = XLSX.utils.sheet_to_json(compilationSheet, { header: 1 })

    const songs = []
    const songLeaderMappings = []

    for (let i = 1; i < compilationData.length; i++) {
      const row = compilationData[i]
      if (row[0] && row[1] && row[2]) {
        const songTitle = row[0]
        const key = row[1]
        const leaderName = row[2]

        // Find the leader ID
        const leader = worshipLeaders.find(l => l.name === leaderName)
        if (!leader) {
          console.warn(`Leader not found: ${leaderName}`)
          continue
        }

        // Create song if doesn't exist
        let song = songs.find(s => s.title === songTitle)
        if (!song) {
          song = {
            title: songTitle,
            original_key: key,
            default_key: key,
            primary_worship_leader_id: leader.id,
            is_active: true
          }

          const { data, error } = await supabase
            .from('songs')
            .upsert(song, { onConflict: 'title,original_key' })
            .select()
            .single()

          if (error) {
            console.error(`Error creating song ${songTitle}:`, error)
            continue
          } else {
            songs.push(data)
            console.log(`✓ Created/updated song: ${songTitle}`)
          }
        }

        // Create worship leader song mapping
        songLeaderMappings.push({
          worship_leader_id: leader.id,
          song_id: song.id || songs.find(s => s.title === songTitle)?.id,
          preferred_key: key
        })
      }
    }

    // Step 3: Create worship leader song preferences
    console.log('\n3. Creating worship leader song preferences...')
    for (const mapping of songLeaderMappings) {
      const { error } = await supabase
        .from('worship_leader_songs')
        .upsert(mapping, { onConflict: 'worship_leader_id,song_id' })

      if (error) {
        console.error('Error creating song preference:', error)
      }
    }
    console.log(`✓ Created ${songLeaderMappings.length} song preferences`)

    // Step 4: Process Chord Viewer sheet
    console.log('\n4. Processing chord sections...')
    if (workbook.SheetNames.includes('Chord Viewer')) {
      const chordSheet = workbook.Sheets['Chord Viewer']
      const chordData = XLSX.utils.sheet_to_json(chordSheet, { header: 1 })

      const chordSections = []
      for (let i = 1; i < chordData.length; i++) {
        const row = chordData[i]
        if (row[0] && row[1]) {
          const songTitle = row[0]
          const section = row[1]
          const chords = row[2] || ''
          const notes = row[4] || ''

          // Find the song
          const song = songs.find(s => s.title === songTitle)
          if (song) {
            chordSections.push({
              song_id: song.id,
              section_name: section,
              chord_progression: chords,
              notes: notes,
              key: song.default_key,
              section_order: i
            })
          }
        }
      }

      if (chordSections.length > 0) {
        for (const section of chordSections) {
          const { error } = await supabase
            .from('chord_sections')
            .insert(section)

          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Error creating chord section:', error)
          }
        }
        console.log(`✓ Created ${chordSections.length} chord sections`)
      }
    }

    // Step 5: Process individual leader sheets for additional preferences
    console.log('\n5. Processing individual leader preferences...')
    const allSheets = workbook.SheetNames.filter(name =>
      !['Song Compilation', 'Chord Viewer'].includes(name)
    )
    for (const sheetName of allSheets) {
      const sheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      const leader = worshipLeaders.find(l => l.name === sheetName)

      if (!leader) continue

      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        if (row[0] && row[1]) {
          const songTitle = row[0]
          const preferredKey = row[1]

          // Find existing song or create a new one
          let song = songs.find(s => s.title === songTitle)
          if (!song) {
            const newSong = {
              title: songTitle,
              original_key: preferredKey,
              default_key: preferredKey,
              primary_worship_leader_id: leader.id,
              is_active: true
            }

            const { data: songData, error } = await supabase
              .from('songs')
              .upsert(newSong, { onConflict: 'title,original_key' })
              .select()
              .single()

            if (!error) {
              songs.push(songData)
              song = songData
            }
          }

          if (song) {
            // Update or create worship leader song preference
            const { error } = await supabase
              .from('worship_leader_songs')
              .upsert({
                worship_leader_id: leader.id,
                song_id: song.id,
                preferred_key: preferredKey
              }, { onConflict: 'worship_leader_id,song_id' })

            if (error) {
              console.error(`Error updating preference for ${songTitle}:`, error)
            }
          }
        }
      }
      console.log(`✓ Processed preferences for ${sheetName}`)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Worship Leaders: ${worshipLeaders.length}`)
    console.log(`   - Songs: ${songs.length}`)
    console.log(`   - Song Preferences: ${songLeaderMappings.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
if (require.main === module) {
  migrateExcelData()
}

module.exports = { migrateExcelData }