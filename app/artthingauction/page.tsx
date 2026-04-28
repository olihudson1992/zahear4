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

/* ===================== INTRO ===================== */

const images = [
  "https://rangatracks.b-cdn.net/artthing%20resize/AJ%20-%20Krakatoaz%20CC_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/alex_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Anna%20%26b%20Robby%20-%20Tiny%20Distraction_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Brad%20-%20Mr%20Gonk_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/CHLOE%20-%20Fuzanglong_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Darcie%20-%20Bag%20Piss_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Deb%20-%20untitled_result.jpg",
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

        if (loadedCount === num) {
          startSpin()
        }
      }
      img.src = src
    })

    function draw() {
      ctx.clearRect(0, 0, size, size)

      for (let i = 0; i < num; i++) {
        const start = offsets[i]
        const end = start + slice

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, start, end)
        ctx.closePath()
        ctx.clip()

        const img = loaded[i]
        if (img) {
          ctx.drawImage(img, 0, 0, size, size)
        }

        ctx.restore()
      }
    }

    let anim: number

    function startSpin() {
      const duration = 4000
      const startTime = Date.now()

      function spin() {
        const t = (Date.now() - startTime) / duration

        const speed = (1 - t) * 0.25

        for (let i = 0; i < num; i++) {
          offsets[i] += speed
        }

        draw()

        if (t < 1) {
          anim = requestAnimationFrame(spin)
        } else {
          onComplete()
        }
      }

      spin()
    }

    return () => cancelAnimationFrame(anim)
  }, [onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

/* ===================== MAIN ===================== */

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)

  const supabase = createClient()

  const fetchPaintings = useCallback(async () => {
    const { data } = await supabase
      .from('paintings')
      .select('*')
      .order('id')

    if (data) setPaintings(data)
  }, [])

  /* ✅ INITIAL LOAD */
  useEffect(() => {
    fetchPaintings()
  }, [fetchPaintings])

  /* 🔥 REALTIME FIX (THIS IS WHAT YOU WERE MISSING) */
  useEffect(() => {
    const channel = supabase
      .channel('paintings-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paintings' },
        (payload) => {
          const updated = payload.new as Painting

          setPaintings(prev =>
            prev.map(p =>
              p.id === updated.id ? updated : p
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleBid(painting: Painting, amount: number) {
    await supabase
      .from('bids')
      .insert({
        painting_id: painting.id,
        bidder_name: 'anon',
        bidder_email: 'anon',
        amount
      })

    await supabase
      .from('paintings')
      .update({ current_bid: amount })
      .eq('id', painting.id)

    setSelectedPainting(null)
  }

  if (paintings.length === 0) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="text-center py-3">
        <h1 className="font-bold">THE EGG ART THING</h1>
      </div>

      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">
        {paintings.map(p => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center"
            onClick={() => setSelectedPainting(p)}
          >
            <img src={p.image_url} className="max-h-[60vh] object-contain" />

            <h2 className="font-bold mt-2">{p.title}</h2>
            <p>{p.artist}</p>

            <p className="text-sky-500 font-bold">
              £{Number(p.current_bid ?? 1).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {selectedPainting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 w-full max-w-sm">
            <p className="font-bold">{selectedPainting.title}</p>

            <input
              type="number"
              min={selectedPainting.current_bid + 0.01}
              defaultValue={selectedPainting.current_bid + 0.01}
              className="border p-2 w-full mt-2"
              id="bid"
            />

            <button
              className="bg-sky-300 w-full mt-2 py-2"
              onClick={() => {
                const input = document.getElementById('bid') as HTMLInputElement
                handleBid(selectedPainting, Number(input.value))
              }}
            >
              Place Bid
            </button>

            <button
              className="w-full mt-2"
              onClick={() => setSelectedPainting(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===================== PAGE ===================== */

export default function Page() {
  const [intro, setIntro] = useState(true)

  return intro ? (
    <IntroAnimation onComplete={() => setIntro(false)} />
  ) : (
    <PaintingsCarousel />
  )
}
