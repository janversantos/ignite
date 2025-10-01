const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env.local') })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Test with anon key (what the app uses)

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Present' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n1. Testing connection...')

    // Test basic connection
    const { data: testData, error: testError } = await supabase.auth.getSession()
    if (testError) {
      console.log('Auth test error (expected):', testError.message)
    } else {
      console.log('✓ Connection established')
    }

    console.log('\n2. Testing songs table...')
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('id, title, default_key')
      .limit(5)

    if (songsError) {
      console.error('❌ Songs query error:', songsError)
    } else {
      console.log('✓ Songs found:', songs?.length || 0)
      if (songs && songs.length > 0) {
        console.log('First few songs:')
        songs.forEach(song => console.log(`  - ${song.title} (${song.default_key})`))
      }
    }

    console.log('\n3. Testing worship leaders table...')
    const { data: leaders, error: leadersError } = await supabase
      .from('worship_leaders')
      .select('id, display_name')
      .limit(5)

    if (leadersError) {
      console.error('❌ Leaders query error:', leadersError)
    } else {
      console.log('✓ Leaders found:', leaders?.length || 0)
      if (leaders && leaders.length > 0) {
        console.log('Leaders:')
        leaders.forEach(leader => console.log(`  - ${leader.display_name}`))
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testConnection()