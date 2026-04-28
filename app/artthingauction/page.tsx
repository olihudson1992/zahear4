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

export default function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const carouselRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const supabase = createClient()

  // 🔥 FETCH WITH REAL BID LOGIC
  const fetchPaintings = async () => {
    const { data: paintingsData } = await supabase
      .from('paintings')
      .select('*')
      .order('id')

    const { data: bidsData } = await supabase
      .from('bids')
      .select('*')

    if (!paintingsData) return

    const updated = paintingsData.map(p => {
      const bidsForPainting = bidsData?.filter(b => b.painting_id === p.id) || []

      const highestBid = bidsForPainting.length
        ? Math.max(...bidsForPainting.map(b => b.amount))
        : 1 // 👈 START AT £1

      return {
        ...p,
        current_bid: highestBid
      }
    })

    setPaintings(updated)
  }

  useEffect(() => {
    fetchPaintings()

    // 🔥 REALTIME
    const channel = supabase
      .channel('bids-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids'
        },
        () => {
          fetchPaintings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return

    const itemWidth = carouselRef.current.scrollWidth / paintings.length

    carouselRef.current.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    })

    setCurrentIndex(index)
  }

  if (paintings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />

      {/* HEADER */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">Tap a painting to bid</p>
      </div>

      {/* CAROUSEL */}
      <div
        ref={carouselRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {paintings.map((p) => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center justify-center px-4"
            onClick={() => setSelectedPainting(p)}
          >
            <div className="flex items-center justify-center h-[60vh] w-full">
              <img
                src={p.image_url}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <h2 className="font-bold mt-2">{p.title}</h2>
            <p className="text-sm text-gray-600">{p.artist}</p>

            <p className="text-sky-500 font-bold mt-1">
              Current bid: £{p.current_bid.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-1 py-2">
        {paintings.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? 'bg-sky-400' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* PLAY BUTTON */}
      <div className="flex justify-center pb-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* MODAL */}
      {selectedPainting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelectedPainting(null)}
        >
          <BidForm
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            refresh={fetchPaintings}
          />
        </div>
      )}
    </div>
  )
}

function BidForm({
  painting,
  onClose,
  refresh
}: {
  painting: Painting
  onClose: () => void
  refresh: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(painting.current_bid + 0.01)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    const supabase = createClient()

    await supabase.from('bids').insert({
      painting_id: painting.id,
      bidder_name: name,
      bidder_email: email,
      amount
    })

    setIsSubmitting(false)
    setSuccess(true)

    refresh()

    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div className="bg-white p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
      {success ? (
        <div className="text-center">
          <p className="text-lg font-bold text-sky-500">Thanks!</p>
          <p className="text-sm">We’ll contact you if you win</p>
        </div>
      ) : (
        <>
          <h2 className="font-bold mb-2">{painting.title}</h2>

          <p className="mb-2">Current: £{painting.current_bid.toFixed(2)}</p>

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border w-full p-2 mb-2"
              required
            />

            <input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border w-full p-2 mb-2"
              required
            />

            <input
              type="number"
              value={amount}
              step={0.01}
              onChange={e => setAmount(Number(e.target.value))}
              className="border w-full p-2 mb-2"
              required
            />

            <button className="bg-sky-300 w-full py-2">
              {isSubmitting ? '...' : 'Place Bid'}
            </button>

            <button type="button" onClick={onClose} className="w-full mt-2">
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  )
}
