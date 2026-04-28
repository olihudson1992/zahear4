'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Painting {
  id: string
  title: string
  artist: string
  image_url: string
  current_bid: number
}

/* ================= INTRO (UNCHANGED) ================= */

const images = [
  "https://rangatracks.b-cdn.net/artthing%20resize/AJ%20-%20Krakatoaz%20CC_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/alex_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Anna%20%26b%20Robby%20-%20Tiny%20Distraction_result.jpg",
]

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(window.innerWidth - 32, window.innerHeight - 120)
    canvas.width = size
    canvas.height = size

    const center = size / 2
    const radius = size / 2 - 10

    const num = images.length
    const slice = (Math.PI * 2) / num

    const loaded: HTMLImageElement[] = []
    let loadedCount = 0
    const offsets = new Array(num).fill(0)

    images.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        loaded[i] = img
        loadedCount++
        if (loadedCount === num) spin()
      }
      img.src = src
    })

    function draw() {
      ctx.clearRect(0, 0, size, size)

      for (let i = 0; i < num; i++) {
        const start = offsets[i]

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, start, start + slice)
        ctx.closePath()
        ctx.clip()

        if (loaded[i]) {
          ctx.drawImage(loaded[i], 0, 0, size, size)
        }

        ctx.restore()
      }
    }

    function spin() {
      const duration = 4000
      const start = Date.now()

      function frame() {
        const t = (Date.now() - start) / duration
        const speed = (1 - t) * 0.2

        for (let i = 0; i < num; i++) offsets[i] += speed

        draw()

        if (t < 1) requestAnimationFrame(frame)
        else onComplete()
      }

      frame()
    }
  }, [onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

/* ================= MAIN ================= */

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)

  const supabase = createClient()

  const fetchPaintings = useCallback(async () => {
    const { data } = await supabase.from('paintings').select('*')
    if (data) setPaintings(data)
  }, [])

  useEffect(() => {
    fetchPaintings()
  }, [])

  /* 🔥 REALTIME FIX (proper + safe merge) */
  useEffect(() => {
    const channel = supabase
      .channel('paintings-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paintings' },
        (payload) => {
          const updated = payload.new as Painting
          if (!updated?.id) return

          setPaintings(prev =>
            prev.map(p =>
              p.id === updated.id ? updated : p
            )
          )
        }
      )
      .subscribe()

    const interval = setInterval(fetchPaintings, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  /* ================= BID ================= */

  async function handleBid(p: Painting, amount: number) {
    await supabase.from('bids').insert({
      painting_id: p.id,
      bidder_name: 'anon',
      bidder_email: 'anon',
      amount
    })

    await supabase
      .from('paintings')
      .update({ current_bid: amount })
      .eq('id', p.id)

    setSelectedPainting(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER (RESTORED TEXT) */}
      <div className="text-center py-3">
        <h1 className="font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">
          Click a painting to place a bid
        </p>
      </div>

      {/* CAROUSEL */}
      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">
        {paintings.map(p => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center"
            onClick={() => setSelectedPainting(p)}
          >
            <img src={p.image_url} className="max-h-[60vh] object-contain" />

            <h2>{p.title}</h2>
            <p>{p.artist}</p>

            <p className="text-sky-500 font-bold">
              £{Number(p.current_bid || 1).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* BID MODAL (RESTORED FULL FORM) */}
      {selectedPainting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 w-full max-w-sm">

            <h2 className="font-bold mb-2">{selectedPainting.title}</h2>

            <input
              id="name"
              placeholder="Name"
              className="border p-2 w-full mb-2"
            />

            <input
              id="email"
              placeholder="Email"
              className="border p-2 w-full mb-2"
            />

            <input
              id="bid"
              type="number"
              defaultValue={selectedPainting.current_bid + 0.01}
              className="border p-2 w-full"
            />

            <button
              className="bg-sky-300 w-full mt-2 py-2"
              onClick={() => {
                const bid = document.getElementById('bid') as HTMLInputElement
                handleBid(selectedPainting, Number(bid.value))
              }}
            >
              Place Bid
            </button>

            <button onClick={() => setSelectedPainting(null)}>
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

/* ================= PAGE ================= */

export default function Page() {
  const [intro, setIntro] = useState(true)

  return intro ? (
    <IntroAnimation onComplete={() => setIntro(false)} />
  ) : (
    <PaintingsCarousel />
  )
}
