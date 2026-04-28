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
]

function IntroAnimation({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(window.innerWidth, window.innerHeight)
    canvas.width = size
    canvas.height = size

    const center = size / 2
    const radius = size / 2 - 10
    const slice = (Math.PI * 2) / images.length

    const imgs: HTMLImageElement[] = []
    let loaded = 0

    let rotation = 0

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

      for (let i = 0; i < images.length; i++) {
        const start = rotation + i * slice
        const end = start + slice

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, start, end)
        ctx.closePath()
        ctx.clip()

        if (imgs[i]) {
          ctx.drawImage(imgs[i], 0, 0, size, size)
        }

        ctx.restore()
      }
    }

    let frame: number
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      rotation += 0.02

      draw()

      if (elapsed < 4000) {
        frame = requestAnimationFrame(animate)
      } else {
        onDone()
      }
    }

    return () => cancelAnimationFrame(frame)
  }, [onDone])

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [showIntro, setShowIntro] = useState(true)

  const [showInfo, setShowInfo] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    const { data: p } = await supabase.from('paintings').select('*')
    const { data: b } = await supabase.from('bids').select('*')

    if (p) setPaintings(p)
    if (b) setBids(b)
  }

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const getBid = (id: number) => {
    const list = bids.filter(b => b.painting_id === id)
    if (!list.length) return 1
    return Math.max(...list.map(b => b.amount))
  }

  if (showIntro) {
    return <IntroAnimation onDone={() => setShowIntro(false)} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">Click a painting to place a bid</p>
      </div>

      {/* CAROUSEL */}
      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">
        {paintings.map(p => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center p-4"
          >
            <img src={p.image_url} className="max-h-[65vh] object-contain" />

            <h2 className="font-bold mt-2">{p.title}</h2>
            <p className="text-sm text-gray-600">{p.artist}</p>

            <p className="text-sky-500 font-bold mt-1">
              Current bid: £{getBid(p.id).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* PLAY + INFO */}
      <div className="flex justify-center gap-3 pb-3 items-center">

        <button
          onClick={() => {
            const audio = document.querySelector('audio')
            if (!audio) return
            if (audio.paused) audio.play()
            else audio.pause()
          }}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          ▶
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold"
        >
          i
        </button>

        <audio
          src="https://rangatracks.b-cdn.net/ENCHELADER.mp3"
          loop
        />
      </div>

      {/* INFO MODAL */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white max-w-md p-5 text-sm leading-relaxed"
            onClick={e => e.stopPropagation()}
          >
            <p>
              28 artists got together in The Egg Cafe in Liverpool, painted, ate and split the costs.
              These paintings are now on auction for an experiment.
            </p>

            <br />

            <p>
              The artists will decide whether to reinvest the money into the group for the next adventure,
              or take their share. The organiser wanted to explore circular systems, sharing and art.
            </p>

            <br />

            <p>
              The artworks are all on 15x30 inch canvas with whatever paints and colours the artists brought with them.
            </p>

            <br />

            <p>
              The auction ends on the 8th of May in The Egg Cafe with a live auction.
            </p>

            <br />

            <p>
              Contact: <strong>wyrdliverpool@gmail.com</strong>
            </p>

            <button
              className="mt-4 w-full bg-sky-300 py-2"
              onClick={() => setShowInfo(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default PaintingsCarousel
