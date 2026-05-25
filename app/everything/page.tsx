"use client"

import dynamic from "next/dynamic"

const OrbScene = dynamic(() => import("./orb-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  ),
})

export default function Page() {
  return <OrbScene />
}
