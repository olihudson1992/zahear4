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

/* ---------------- INTRO ANIMATION ---------------- */

const images = [
  "https://rangatracks.b-cdn.net/artthing%20resize/AJ%20-%20Krakatoaz%20CC_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/alex_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Anna%20%26b%20Robby%20-%20Tiny%20Distraction_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Brad%20-%20Mr%20Gonk_result.jpg",
]

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = Math.min(window.innerWidth, window.innerHeight) * 0.85
    canvas.width = size
    canvas.height = size

    const center = size / 2
    const radius = size / 2 - 10

    const imgs: HTMLImageElement[] = []
    let loaded = 0

    images.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        imgs[i] = img
        loaded++

        if (loaded === images.length) start()
      }
      img.src = src
    })

    let rotation = 0
    let startTime: number

    function draw() {
      ctx.clearRect(0, 0, size, size)

      const slice = (Math.PI * 2) / imgs.length

      imgs.forEach((img, i) => {
        const a1 = rotation + i * slice
        const a2 = a1 + slice

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, a1, a2)
        ctx.clip()

        ctx.drawImage(img, 0, 0, size, size)
        ctx.restore()
      })
    }

    function start() {
      startTime = performance.now()

      function animate(t: number) {
        const elapsed = t - startTime

        // slower start, longer spin (4s total)
        const progress = Math.min(elapsed / 4000, 1)
        rotation = progress * Math.PI * 6

        draw()

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          onComplete()
        }
      }

      requestAnimationFrame(animate)
    }
  }, [onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

/* ---------------- MAIN APP ---------------- */

export default function Page() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [showIntro, setShowIntro] = useState(true)
  const supabase = createClient()

  const fetchPaintings = useCallback(async () => {
    const { data } = await supabase
      .from("paintings")
      .select("*")
      .order("id")

    if (data) {
      setPaintings(
        data.map(p => ({
          ...p,
          artist: p.artist === "Tom FM" ? "Tom" : p.artist
        }))
      )
    }
  }, [supabase])

  /* initial load */
  useEffect(() => {
    fetchPaintings()
  }, [fetchPaintings])

  /* realtime + fallback refetch (THIS FIXES YOUR ISSUE) */
  useEffect(() => {
    fetchPaintings()

    const channel = supabase
      .channel("paintings-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "paintings" },
        () => {
          fetchPaintings()
        }
      )
      .subscribe()

    const interval = setInterval(fetchPaintings, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [supabase, fetchPaintings])

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-xl font-bold text-center">The Egg Art Thing</h1>

      <div className="grid gap-4 mt-4">
        {paintings.map(p => (
          <div key={p.id} className="text-center">
            <img
              src={p.image_url}
              className="max-h-[60vh] mx-auto object-contain"
            />
            <p className="font-bold">{p.title}</p>
            <p>{p.artist}</p>
            <p className="text-sky-500">
              £{Number(p.current_bid).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
