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

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [initialScrollDone, setInitialScrollDone] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const supabase = createClient()

  const fetchPaintings = useCallback(async () => {
    const { data: paintingsData } = await supabase
      .from('paintings')
      .select('*')
      .order('id')

    const { data: bidsData } = await supabase
      .from('bids')
      .select('painting_id, amount')

    if (!paintingsData || !bidsData) return

    // 🔥 TRUE SOURCE OF TRUTH: recompute from bids
    const highest: Record<string, number> = {}

    bidsData.forEach(b => {
      if (!highest[b.painting_id] || b.amount > highest[b.painting_id]) {
        highest[b.painting_id] = b.amount
      }
    })

    const merged = paintingsData.map(p => ({
      ...p,
      current_bid: highest[p.id] ?? 1
    }))

    setPaintings(merged)
  }, [supabase])

  useEffect(() => {
    fetchPaintings()

    const channel = supabase
      .channel('bids-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => fetchPaintings()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPaintings, supabase])

  useEffect(() => {
    if (paintings.length && carouselRef.current && !initialScrollDone) {
      const randomIndex = Math.floor(Math.random() * paintings.length)
      setCurrentIndex(randomIndex)

      const itemWidth = carouselRef.current.scrollWidth / paintings.length
      carouselRef.current.scrollLeft = itemWidth * randomIndex

      setInitialScrollDone(true)
    }
  }, [paintings, initialScrollDone])

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return

    const itemWidth = carouselRef.current.scrollWidth / paintings.length
    carouselRef.current.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    })

    setCurrentIndex(index)
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()

    setIsPlaying(!isPlaying)
  }

  const handleBidPlaced = async (id: string, amount: number) => {
    await supabase.from('bids').insert({
      painting_id: id,
      amount
    })

    // instant UI update
    setPaintings(prev =>
      prev.map(p =>
        p.id === id ? { ...p, current_bid: amount } : p
      )
    )
  }

  if (!paintings.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />

      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">Tap a painting to bid</p>
      </div>

      <div
        ref={carouselRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {paintings.map(painting => (
          <div
            key={painting.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center px-4 py-2"
            onClick={() => setSelectedPainting(painting)}
          >
            <img src={painting.image_url} className="max-h-[60vh] object-contain" />

            <h2 className="font-bold mt-2">{painting.title}</h2>
            <p className="text-sm text-gray-600">{painting.artist}</p>

            <p className="text-sky-500 font-bold mt-1">
              Current bid: £{painting.current_bid.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1 py-2">
        {paintings.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-sky-400' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      <div className="flex justify-center pb-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {selectedPainting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelectedPainting(null)}
        >
          <BidForm
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            onBidPlaced={handleBidPlaced}
          />
        </div>
      )}
    </div>
  )
}

function BidForm({
  painting,
  onClose,
  onBidPlaced
}: {
  painting: Painting
  onClose: () => void
  onBidPlaced: (id: string, amount: number) => void
}) {
  const [amount, setAmount] = useState(painting.current_bid + 0.01)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minBid = painting.current_bid + 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (amount < minBid) return

    setIsSubmitting(true)

    await onBidPlaced(painting.id, amount)

    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="bg-white p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
      <h2 className="font-bold">{painting.title}</h2>

      <p className="mb-2">Current: £{painting.current_bid.toFixed(2)}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          min={minBid}
          step={0.01}
          onChange={e => setAmount(Number(e.target.value))}
          className="border w-full p-2 mb-2"
        />

        <button className="bg-sky-300 w-full py-2">
          {isSubmitting ? '...' : 'Place Bid'}
        </button>

        <button type="button" onClick={onClose} className="w-full mt-2">
          Cancel
        </button>
      </form>
    </div>
  )
}

export default PaintingsCarousel
