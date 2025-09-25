"use client"

import dynamic from 'next/dynamic'

const ThreeScene = dynamic(() => import('./three-scene-impl'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-2xl luminari mb-4">Loading...</div>
      </div>
    </div>
  ),
})

export default ThreeScene