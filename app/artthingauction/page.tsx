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
  const [showIntro, setShowIntro] = useState(true)

  const carouselRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const supabase = createClient()

  // ---------------- FETCH ----------------
  const fetchPaintings = useCallback(async () => {
    const { data } = await supabase
      .from('paintings')
      .select('*')
      .order('id')

    if (data) {
      setPaintings(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchPaintings()

    // 🔥 REALTIME FIX (important)
    const channel = supabase
      .channel('paintings-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paintings' },
        (payload) => {
          const updated = payload.new as Painting

          setPaintings(prev =>
            prev.map(p => (p.id === updated.id ? updated : p))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPaintings])

  // ---------------- INTRO SCROLL ----------------
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

  // ---------------- BID UPDATE FIX ----------------
  const handleBidPlaced = async (id: string, amount: number) => {
    setPaintings(prev =>
      prev.map(p =>
        p.id === id ? { ...p, current_bid: amount } : p
      )
    )

    setSelectedPainting(prev =>
      prev?.id === id ? { ...prev, current_bid: amount } : prev
    )

    await supabase
      .from('paintings')
      .update({ current_bid: amount })
      .eq('id', id)
  }

  // ---------------- INTRO ----------------
  if (showIntro) {
    return (
      <IntroAnimation
        onComplete={() => setShowIntro(false)}
      />
    )
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

      {/* Header */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-xs text-gray-500">Click a painting to place a bid</p>
      </div>

      {/* Carousel */}
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
            <div className="flex-1 flex items-center justify-center w-full">
              <img
                src={painting.image_url}
                className="max-h-[65vh] object-contain"
              />
            </div>

            <h2 className="font-bold mt-2">{painting.title}</h2>
            <p className="text-sm text-gray-600">{painting.artist}</p>

            <p className="text-sky-500 font-bold mt-1">
              Current bid: £{painting.current_bid.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="flex justify-center gap-1 py-2">
        {paintings.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-sky-400' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* play */}
      <div className="flex justify-center pb-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 rounded-full flex items-center justify-center"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* modal */}
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

// ---------------- BID FORM ----------------
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

// ---------------- INTRO ANIMATION ----------------
function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 4000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-400" />
    </div>
  )
}

export default PaintingsCarousel
