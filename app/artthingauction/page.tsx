'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [selectedPainting, setSelectedPainting] = useState<any>(null)

  const supabase = createClient()

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    const { data: p } = await supabase
      .from('paintings')
      .select('*')

    const { data: b } = await supabase
      .from('bids')
      .select('*')

    if (p) setPaintings(p)
    if (b) setBids(b)
  }

  // ---------------- INIT + POLLING (SAFE MODE) ----------------
  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // ---------------- GET CURRENT BID ----------------
  const getBid = (paintingId: number) => {
    const list = bids.filter(b => b.painting_id === paintingId)

    if (!list.length) return 1

    return Math.max(...list.map(b => b.amount))
  }

  if (!paintings.length) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
      </div>

      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">
        {paintings.map(p => {
          const bid = getBid(p.id)

          return (
            <div
              key={p.id}
              className="w-full flex-shrink-0 snap-center flex flex-col items-center p-4"
              onClick={() => setSelectedPainting(p)}
            >
              <img
                src={p.image_url}
                className="max-h-[65vh] object-contain"
              />

              <h2 className="font-bold mt-2">{p.title}</h2>
              <p className="text-sm text-gray-600">{p.artist}</p>

              <p className="text-sky-500 font-bold mt-1">
                Current bid: £{bid.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PaintingsCarousel
