import { SongDashboard } from '@/components/SongDashboard'

export default function SongsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Worship Songs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse chord charts and keys for your worship team
          </p>
        </div>
      </div>

      <SongDashboard />
    </>
  )
}