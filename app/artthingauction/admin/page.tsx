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
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .order('id')

    if (!error && data) {
      setPaintings(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchPaintings()

    // REAL FIX: keep bids synced properly
    const interval = setInterval(() => {
      fetchPaintings()
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchPaintings])

  useEffect(() => {
    if (paintings.length > 0 && carouselRef.current && !initialScrollDone) {
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

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // FIXED BID UPDATE (NO DESYNC)
  const handleBidPlaced = async (id: string, amount: number) => {
    await supabase
      .from('paintings')
      .update({ current_bid: amount })
      .eq('id', id)

    await fetchPaintings()
  }

  // ================================
  // TITLE + ARTIST FIXES
  // ================================
  const fixMeta = (p: Painting) => {
    const map: Record<string, { title?: string; artist?: string }> = {
      'DSCF5214': { title: 'Big Al' },
      'Untitled-DSCF5198': { title: 'Who needs skin?', artist: 'Bethan' },
      'Green Blue Abstract': { artist: 'Tom FM' },
      'Cats': { artist: 'Tom' },
      'Elleyna': { artist: 'Elenyar' },
    }

    return {
      title: map[p.title]?.title || p.title,
      artist: map[p.title]?.artist || p.artist,
    }
  }

  // ================================
  // ROTATION FIXES
  // ================================
  const getRotation = (p: Painting) => {
    const rotate90 = ['Elleyna', 'Joanne Untitled', 'Tilda']
    const rotateMinus90 = ['Lynn']
    const rotate180 = ['Big Al', 'Anna and Robby', 'Eliza', 'Green Blue Abstract']

    if (rotate90.includes(p.title)) return 'rotate(90deg)'
    if (rotateMinus90.includes(p.title)) return 'rotate(-90deg)'
    if (rotate180.includes(p.title)) return 'rotate(180deg)'
    return 'none'
  }

  if (paintings.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        Loading paintings...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>
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
        {paintings.map((painting) => {
          const fixed = fixMeta(painting)

          return (
            <div
              key={painting.id}
              className="w-full flex-shrink-0 snap-center flex flex-col items-center justify-center px-4 py-2"
              onClick={() => setSelectedPainting(painting)}
            >
              {/* IMAGE WRAPPER FIXED CENTER */}
              <div className="flex items-center justify-center w-full h-[65vh]">
                <img
                  src={painting.image_url}
                  className="max-h-full max-w-full object-contain"
                  style={{
                    transform: getRotation(painting),
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>

              <h2 className="font-bold mt-2">{fixed.title}</h2>
              <p className="text-sm text-gray-600">{fixed.artist}</p>

              <p className="text-sky-500 font-bold mt-1">
                Current bid: £{painting.current_bid.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-1 py-2">
        {paintings.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-sky-400' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* PLAY */}
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState(painting.current_bid + 0.01)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minBid = painting.current_bid + 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount < minBid) return

    setIsSubmitting(true)

    const supabase = createClient()

    await supabase.from('bids').insert({
      painting_id: painting.id,
      bidder_name: name,
      bidder_email: email,
      amount
    })

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
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border w-full p-2 mb-2"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border w-full p-2 mb-2"
        />

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
