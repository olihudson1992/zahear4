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
  "https://rangatracks.b-cdn.net/artthing%20resize/DSCF5195_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/DSCF5198_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/DSCF5208_result.jpg",
]

/* ---------------- INTRO ANIMATION (YOUR ORIGINAL) ---------------- */
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

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    const numSlices = images.length
    const sliceAngle = (2 * Math.PI) / numSlices

    let loadedImages = 0
    const imageElements: HTMLImageElement[] = []

    const sliceSpeeds: number[] = []
    const sliceOffsets: number[] = []

    for (let i = 0; i < numSlices; i++) {
      sliceSpeeds[i] = (Math.random() - 0.5) * 0.015
      sliceOffsets[i] = i * sliceAngle
    }

    images.forEach((src, index) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        imageElements[index] = img
        loadedImages++

        if (loadedImages === images.length) {
          draw()
          setTimeout(animate, 5000)
        }
      }

      img.src = src
    })

    let animationId: number

    function animate() {
      for (let i = 0; i < numSlices; i++) {
        sliceOffsets[i] += sliceSpeeds[i]
        sliceSpeeds[i] *= 0.999
      }

      draw()
      animationId = requestAnimationFrame(animate)
    }

    function draw() {
      if (!ctx) return

      ctx.clearRect(0, 0, size, size)

      for (let i = 0; i < numSlices; i++) {
        const start = sliceOffsets[i] - Math.PI / 2
        const end = start + sliceAngle
        const mid = (start + end) / 2

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, start, end)
        ctx.closePath()
        ctx.clip()

        const img = imageElements[i]
        if (img) {
          const scale = (radius * 2) / Math.min(img.width, img.height)
          const x = centerX - (img.width * scale) / 2
          const y = centerY - (img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        }

        ctx.restore()
      }
    }

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

/* ---------------- MAIN APP ---------------- */
export default function PaintingsCarousel() {
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
          <div key={p.id} className="w-full flex-shrink-0 snap-center flex flex-col items-center p-4">
            <img src={p.image_url} className="max-h-[65vh] object-contain" />

            <h2 className="font-bold mt-2">{p.title}</h2>
            <p className="text-sm text-gray-600">{p.artist}</p>

            <p className="text-sky-500 font-bold mt-1">
              Current bid: £{getBid(p.id).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-3 pb-3 items-center">

        {/* play */}
        <button
          onClick={() => {
            const audio = document.querySelector('audio')
            if (!audio) return
            audio.paused ? audio.play() : audio.pause()
          }}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          ▶
        </button>

        {/* info */}
        <button
          onClick={() => setShowInfo(true)}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold"
        >
          i
        </button>

        <audio src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />
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
              The artists decide whether to reinvest the money into the group or take their share.
              The organiser wanted to explore circular systems, sharing and art.
            </p>

            <br />

            <p>
              15x30 inch canvases, using whatever paints the artists brought.
            </p>

            <br />

            <p>
              Auction ends 8th May at The Egg Cafe with a live auction.
            </p>

            <br />

            <p><strong>wyrdliverpool@gmail.com</strong></p>

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
