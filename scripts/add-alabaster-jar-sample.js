const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function addAlabasterJarSample() {
  try {
    console.log('Adding Alabaster Jar sample song...')

    // First, get or create a worship leader
    let { data: worshipLeaders, error: leaderError } = await supabase
      .from('worship_leaders')
      .select('id, display_name')
      .eq('display_name', 'Gateway Worship')
      .single()

    if (leaderError && leaderError.code === 'PGRST116') {
      // Create Gateway Worship leader if doesn't exist
      const { data: newLeader, error: createError } = await supabase
        .from('worship_leaders')
        .insert({
          name: 'gateway_worship',
          display_name: 'Gateway Worship',
          email: null,
          phone: null,
          is_active: true
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating worship leader:', createError)
        return
      }
      worshipLeaders = newLeader
    }

    // Create the song
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        title: 'Alabaster Jar',
        original_key: 'C',
        default_key: 'C',
        primary_worship_leader_id: worshipLeaders.id,
        category: 'Worship',
        song_type: 'Slow',
        language: 'English',
        tempo: 72,
        time_signature: '4/4',
        notes: 'Beautiful worship ballad about surrendering all to Jesus. References the biblical story of the woman with the alabaster jar.',
        is_active: true
      })
      .select()
      .single()

    if (songError) {
      console.error('Error creating song:', songError)
      return
    }

    console.log('Created song:', song.title)

    // Add chord sections
    const sections = [
      {
        song_id: song.id,
        section_type: 'intro',
        section_label: 'Intro',
        section_order: 1,
        chords: 'C - G/B - Am - F - C - G - F',
        content: ''
      },
      {
        song_id: song.id,
        section_type: 'verse',
        section_label: 'Verse 1',
        section_order: 2,
        chords: 'C - G/B - Am - F - C - G - F',
        content: 'This alabaster jar is all I have of worth\nI break it at Your feet Lord, it\'s less than You deserve\nYou\'re worthy, You\'re worthy of more'
      },
      {
        song_id: song.id,
        section_type: 'verse',
        section_label: 'Verse 2',
        section_order: 3,
        chords: 'C - G/B - Am - F - C - G - F',
        content: 'This time that I have left is all I have of worth\nI lay it at Your feet Lord, it\'s less than You deserve\nYou\'re worthy, You\'re worthy of more'
      },
      {
        song_id: song.id,
        section_type: 'chorus',
        section_label: 'Chorus',
        section_order: 4,
        chords: 'Am - F - C - G - Am - F - C - G',
        content: 'And I pour out my love, pour out my love\nNothing held back\nAnd I pour out my love, pour out my love\nA sweet sacrifice'
      },
      {
        song_id: song.id,
        section_type: 'verse',
        section_label: 'Verse 3',
        section_order: 5,
        chords: 'C - G/B - Am - F - C - G - F',
        content: 'This heart that I have here is all I have of worth\nI give it willingly Lord, for less than You deserve\nYou\'re worthy, You\'re worthy of more'
      },
      {
        song_id: song.id,
        section_type: 'bridge',
        section_label: 'Bridge',
        section_order: 6,
        chords: 'F - Am - G - C - F - Am - G',
        content: 'Worthy, You are worthy\nKing of kings, Lord of lords\nYou are worthy'
      }
    ]

    for (const section of sections) {
      const { error: sectionError } = await supabase
        .from('chord_sections')
        .insert(section)

      if (sectionError) {
        console.error(`Error creating section ${section.section_label}:`, sectionError)
      } else {
        console.log(`Created section: ${section.section_label}`)
      }
    }

    console.log('✅ Successfully added Alabaster Jar sample song!')

  } catch (error) {
    console.error('Error adding sample song:', error)
  }
}

addAlabasterJarSample()