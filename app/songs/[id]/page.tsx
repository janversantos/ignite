import { SongsService } from '@/lib/songsData'
import SongDetailClient from './SongDetailClient'

export async function generateStaticParams() {
  const songs = SongsService.getSongs()
  return songs.map((song) => ({
    id: song.id.toString(),
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SongPage({ params }: PageProps) {
  const { id } = await params
  return <SongDetailClient id={id} />
}