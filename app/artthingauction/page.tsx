'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Painting {
  id: number
  title: string
  artist: string
  image_url: string
  current_bid: number
}

// 🎡 INTRO IMAGES
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
  "https://rangatracks.b-cdn.net/artthing%20resize/Eliza%20-%20Issac_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Elleyna%20-%20Trukish%20Cafe_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Eva%20-%20_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Evelyn%20-%20I%20dont%20know%20(wink%20wink)_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Harry%20-%20Where's%20the%20Whale_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Hattie%20-%20unknown_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Isaac%20-%20Animal%20Instinct_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Joanne%20-%20table%20top%20view_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Joanne%20-%20untitled_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Lynn%20-%20The%20Sigh_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Marths%20maybe%20-%20I%20can't%203_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Meta%20-%20Metamorphosis_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/OLI%20-%20PANTOMINE_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Rose%20-%20Running%20to%20the%20chapel%20and%20talking%20to%20the%20aliens_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Taco%20-%20Unknown_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Tilda%20-%20Unknown_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Tom%20-%20Revolving%20faces_result.jpg",
  "https://rangatracks.b-cdn.net/artthing%20resize/Tom%20-%20Scratch_result.jpg",
]

// 🎡 INTRO COMPONENT
function Intro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8
    canvas.width = size
    canvas.height = size

    const center = size / 2
    const radius = center - 10
    const slice = (2 * Math.PI) / images.length

    let angle = 0
    let loaded = 0
    const imgs: HTMLImageElement[] = []

    images.forEach((src, i) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imgs[i] = img
        loaded++
        if (loaded === images.length) draw()
      }
      img.src = src
    })

    function draw() {
      ctx.clearRect(0, 0, size, size)

      for (let i = 0; i < images.length; i++) {
        const start = angle + i * slice
        const end = start + slice

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, start, end)
        ctx.closePath()
        ctx.clip()

        const img = imgs[i]
        if (img) {
          ctx.drawImage(img, 0, 0, size, size)
        }

        ctx.restore()
      }
    }

    let start = Date.now()

    function animate() {
      const t = Date.now() - start

      if (t < 2500) {
        angle += 0.03
        draw()
        requestAnimationFrame(animate)
      } else {
        onDone()
      }
    }

    animate()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <canvas ref={canvasRef} />
    </div>
  )
}

// 🎯 MAIN APP
export default function Page() {
  const [showIntro, setShowIntro] = useState(true)

  return showIntro
    ? <Intro onDone={() => setShowIntro(false)} />
    : <Carousel />
}

// 🎯 CAROUSEL (your working one)
function Carousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)

  const supabase = createClient()

  const fetchPaintings = async () => {
    const { data: paintingsData } = await supabase.from('paintings').select('*')
    const { data: bidsData } = await supabase.from('bids').select('*')

    if (!paintingsData) return

    const updated = paintingsData.map(p => {
      const bids = bidsData?.filter(b => b.painting_id === p.id) || []
      const highest = bids.length ? Math.max(...bids.map(b => b.amount)) : 1

      return { ...p, current_bid: highest }
    })

    setPaintings(updated)
  }

  useEffect(() => {
    fetchPaintings()

    const channel = supabase
      .channel('live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, fetchPaintings)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
      </div>

      <div className="flex-1 overflow-x-auto flex">
        {paintings.map(p => (
          <div key={p.id} className="w-full flex-shrink-0 flex flex-col items-center justify-center"
            onClick={() => setSelectedPainting(p)}
          >
            <img src={p.image_url} className="max-h-[60vh] object-contain" />
            <h2>{p.title}</h2>
            <p>{p.artist}</p>
            <p>£{p.current_bid.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {selectedPainting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelectedPainting(null)}
        >
          <BidForm painting={selectedPainting} onClose={() => setSelectedPainting(null)} refresh={fetchPaintings}/>
        </div>
      )}
    </div>
  )
}

function BidForm({ painting, onClose, refresh }: any) {
  const [amount, setAmount] = useState(painting.current_bid + 0.01)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e:any) => {
    e.preventDefault()

    const supabase = createClient()

    await supabase.from('bids').insert({
      painting_id: painting.id,
      bidder_name: name,
      bidder_email: email,
      amount
    })

    setDone(true)
    refresh()

    setTimeout(onClose, 2000)
  }

  return (
    <div className="bg-white p-6" onClick={e=>e.stopPropagation()}>
      {done ? (
        <p>Thanks! We’ll contact you if you win</p>
      ) : (
        <form onSubmit={submit}>
          <p>£{painting.current_bid.toFixed(2)}</p>

          <p className="text-sm text-gray-500 italic mb-2">
            The artists decide what they do with the money, and 20% goes to The Egg
          </p>

          <input placeholder="name" onChange={e=>setName(e.target.value)} />
          <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
          <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />

          <button>bid</button>
        </form>
      )}
    </div>
  )
}
