import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development/localhost
    const host = request.headers.get('host') || ''
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
      return NextResponse.json(
        { error: 'This endpoint is only available on localhost' },
        { status: 403 }
      )
    }

    const { songs } = await request.json()

    if (!songs || !Array.isArray(songs)) {
      return NextResponse.json(
        { error: 'Invalid songs data' },
        { status: 400 }
      )
    }

    // Path to songs.json file
    const filePath = join(process.cwd(), 'data', 'songs.json')

    // Create the data structure
    const data = {
      songs,
      lastUpdated: new Date().toISOString()
    }

    // Write to file
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Songs saved successfully to data/songs.json',
      count: songs.length
    })
  } catch (error: any) {
    console.error('Error saving songs:', error)
    return NextResponse.json(
      { error: 'Failed to save songs', details: error.message },
      { status: 500 }
    )
  }
}
