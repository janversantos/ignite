import { NextResponse } from 'next/server'
import { APP_VERSION, APP_BUILD_DATE } from '@/lib/version'

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    buildDate: APP_BUILD_DATE,
    timestamp: new Date().toISOString()
  })
}
