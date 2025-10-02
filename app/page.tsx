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
          {/* App Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/icon-192.png"
              alt="Ignite Chords"
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 dark:from-primary-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              Ignite Chords
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Worship Songs & Chord Management
          </p>

          {/* Features */}
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Transpose • Setlists • Keys • Teams
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