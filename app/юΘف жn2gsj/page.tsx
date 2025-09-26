'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EncodedRangaPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the actual ranga page
    router.replace('/ranga')
  }, [router])

  // Show loading state during redirect
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-2xl luminari mb-4">Redirecting...</div>
      </div>
    </div>
  )
}