import { QuickStats } from '@/components/QuickStats'
import { UpcomingServices } from '@/components/UpcomingServices'
import { KeyDistribution } from '@/components/KeyDistribution'
import { MostUsedSongs } from '@/components/MostUsedSongs'
import { ChordTransposer } from '@/components/ChordTransposer'

export default function Home() {
  return (
    <>
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome to Ignite Chords
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your worship songs, keys, and chord progressions with ease
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Services - TOP PRIORITY */}
          <UpcomingServices />

          {/* Quick Stats */}
          <QuickStats />

          {/* Most Used Songs */}
          <MostUsedSongs />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          {/* Chord Transposer */}
          <ChordTransposer />

          {/* Key Distribution */}
          <KeyDistribution />
        </div>
      </div>
    </>
  )
}