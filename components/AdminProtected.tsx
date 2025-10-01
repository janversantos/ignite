'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Lock } from 'lucide-react'

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAdminAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Checking authentication...
          </h3>
        </div>
      </div>
    )
  }

  return <>{children}</>
}