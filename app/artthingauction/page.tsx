'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const images = [
  "https://rangatracks.b-cdn.net/artthing%20resize/AJ%20-%20Krakatoaz%20CC_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/alex_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Anna%20%26b%20Robby%20-%20Tiny%20Distraction_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Brad%20-%20Mr%20Gonk_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/CHLOE%20-%20Fuzanglong_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Darcie%20-%20Bag%20Piss_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Deb%20-%20untitled_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/DSCF5198_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Eliza%20-%20Issac_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Tom%20-%20Revolving%20faces_result.jpg",
]

/* ================= INTRO ================= */
function IntroAnimation({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = Math.min(window.innerWidth - 32, window.innerHeight - 160) * 0.82
    canvas.width = size
    canvas.height = size

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 10

    const numSlices = images.length
    const sliceAngle = (2 * Math.PI) / numSlices

    const imgs: HTMLImageElement[] = []
    let loaded = 0

    const offsets: number[] = []
    const speeds: number[] = []

    for (let i = 0; i < numSlices; i++) {
      offsets[i] = i * sliceAngle
      speeds[i] = (Math.random() - 0.5) * 0.08
    }

    const start = performance.now()
    const DURATION = 4000
    let frame: number

    images.forEach((src, i) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imgs[i] = img
        loaded++
        if (loaded === images.length) animate()
      }
      img.src = src
    })

    function draw() {
      ctx.clearRect(0, 0, size, size)

      for (let i = 0; i < numSlices; i++) {
        const a = offsets[i] - Math.PI / 2
        const b = a + sliceAngle

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, radius, a, b)
        ctx.closePath()
        ctx.clip()

        const img = imgs[i]
        if (img) {
          const scale = (radius * 2.2) / Math.min(img.width, img.height)
          ctx.drawImage(
            img,
            cx - (img.width * scale) / 2,
            cy - (img.height * scale) / 2,
            img.width * scale,
            img.height * scale
          )
        }

        ctx.restore()
      }
    }

    function animate() {
      const t = performance.now() - start
      const p = t / DURATION
      const damp = Math.max(0.02, 1 - p)

      for (let i = 0; i < numSlices; i++) {
        offsets[i] += speeds[i] * damp
        speeds[i] *= 0.98
      }

      draw()

      if (t < DURATION) {
        frame = requestAnimationFrame(animate)
      } else {
        draw()
        setTimeout(onDone, 200)
      }
    }

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

/* ================= MAIN ================= */
export default function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [showIntro, setShowIntro] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: p } = await supabase.from('paintings').select('*')
      const { data: b } = await supabase.from('bids').select('*')
      if (p) setPaintings(p)
      if (b) setBids(b)
    }

    fetchData()
    const i = setInterval(fetchData, 2000)
    return () => clearInterval(i)
  }, [])

  const getBid = (id: number) => {
    const list = bids.filter(b => b.painting_id === id)
    return list.length ? Math.max(...list.map(b => b.amount)) : 1
  }

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      await audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleBid = async (e: any) => {
    e.preventDefault()

    const form = new FormData(e.target)

    await supabase.from("bids").insert({
      painting_id: selected.id,
      bidder_name: form.get("name"),
      bidder_email: form.get("email"),
      amount: Number(form.get("amount"))
    })

    setSelected(null)
  }

  // ✅ FIXED POSITION (IMPORTANT)
  const getTitle = (title: string) => {
    if (title === "Tom FM") return "Tom"
    return title
  }

  if (showIntro) return <IntroAnimation onDone={() => setShowIntro(false)} />

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">

      <audio
        ref={audioRef}
        src="https://rangatracks.b-cdn.net/ENCHELADER.mp3"
        loop
      />

      {/* HEADER */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">Click a painting to bid</p>
      </div>

      {/* CAROUSEL */}
      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">

        {paintings.map(p => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center justify-center min-h-[75vh] p-4"
            onClick={() => setSelected(p)}
          >
            <div className="flex items-center justify-center h-[55vh] w-full">
              <img
                src={p.image_url}
                className={`max-h-full max-w-full object-contain ${
                  p.image_url.includes("DSCF5198")
                    ? "rotate-90"
                    : p.image_url.includes("DSCF5208")
                    ? "-rotate-90"
                    : p.image_url.includes("Tom%20-%20Scratch")
                    ? "rotate-180"
                    : ""
                }`}
              />
            </div>

            <div className="text-center mt-3">
              <h2 className="font-bold">{getTitle(p.title)}</h2>
              <p className="text-sm text-gray-600">{p.artist}</p>
              <p className="text-sky-500 font-bold mt-1">
                £{getBid(p.id).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-3 pb-3">

        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="w-10 h-10 bg-gray-200 rounded-full font-bold"
        >
          i
        </button>

      </div>

      {/* INFO */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div className="bg-white w-full max-w-md max-h-[70vh] overflow-y-auto p-4 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs leading-relaxed">
              28 artists got together in The Egg Cafe in Liverpool, painted, ate and split the costs...
            </p>
            <button className="mt-4 w-full bg-sky-300 py-2" onClick={() => setShowInfo(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* BID MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <form
            onSubmit={handleBid}
            className="bg-white p-5 w-80"
            onClick={e => e.stopPropagation()}
          >

            <h2 className="font-bold mb-2">{selected.title}</h2>
            <p className="mb-2">Current: £{getBid(selected.id).toFixed(2)}</p>

            <input name="name" placeholder="Name" className="border w-full p-2 mb-2" required />
            <input name="email" placeholder="Email" className="border w-full p-2 mb-2" required />
            <input
              name="amount"
              type="number"
              step="0.01"
              min={getBid(selected.id) + 0.01}
              className="border w-full p-2 mb-2"
              required
            />

            <button className="bg-sky-300 w-full py-2">
              Place Bid
            </button>

          </form>
        </div>
      )}

    </div>
  )
}
