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

interface Bid {
  id: string
  painting_id: string
  bidder_name: string
  bidder_email: string
  amount: number
  created_at: string
}

function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const fetchPaintings = useCallback(async () => {
    try {
      console.log("[v0] Fetching paintings...")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("paintings")
        .select("*")
        .order("id")
      
      console.log("[v0] Paintings data:", data)
      console.log("[v0] Paintings error:", error)
      
      if (error) {
        console.log("[v0] Supabase error:", error.message)
        return
      }
      
      if (data) {
        console.log("[v0] Setting paintings, count:", data.length)
        setPaintings(data)
      }
    } catch (e) {
      console.log("[v0] Catch error:", e)
    }
  }, [])

  useEffect(() => {
    fetchPaintings()
  }, [fetchPaintings])

  // Scroll to random painting on initial load
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
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.scrollWidth / paintings.length
      carouselRef.current.scrollLeft = itemWidth * index
      setCurrentIndex(index)
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (paintings.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "Arial, sans-serif" }}>
        <p>Loading paintings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "Arial, sans-serif" }}>
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />
      
      {/* Header */}
      <div className="text-center py-2 px-4">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-gray-500 text-xs">Tap a painting to bid</p>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex-1 overflow-x-auto snap-x snap-mandatory scroll-smooth flex"
      >
        {paintings.map((painting) => (
          <div 
            key={painting.id}
            className="flex-shrink-0 w-full snap-center flex flex-col items-center px-4 py-2"
            onClick={() => setSelectedPainting(painting)}
          >
            <div className="relative w-full flex-1 flex items-center justify-center px-2">
              <img
                src={painting.image_url}
                alt={painting.title}
                className="max-w-full max-h-full object-contain shadow-lg"
                style={{ maxHeight: "calc(100vh - 220px)" }}
              />
            </div>
            <div className="text-center py-3">
              <h2 className="text-lg font-bold">{painting.title}</h2>
              <p className="text-gray-600 text-sm">by {painting.artist}</p>
              <p className="text-base font-bold text-sky-500 mt-1">
                Current bid: £{painting.current_bid.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1 py-1">
        {paintings.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentIndex ? "bg-sky-400 w-3" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Play button */}
      <div className="flex flex-col items-center py-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 hover:bg-sky-400 rounded-full flex items-center justify-center transition-all shadow-md"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Bid Modal */}
      {selectedPainting && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPainting(null)}
        >
          <BidForm 
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            onBidPlaced={() => {
              fetchPaintings()
            }}
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
  onBidPlaced: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState(Number((painting.current_bid + 0.01).toFixed(2)))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [bidSuccess, setBidSuccess] = useState(false)

  const minBid = Number((painting.current_bid + 0.01).toFixed(2))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (amount < minBid) {
      setError(`Minimum bid is £${minBid.toFixed(2)}`)
      return
    }

    setIsSubmitting(true)
    
    const supabase = createClient()
    
    // Insert bid
    const { error: bidError } = await supabase
      .from("bids")
      .insert({
        painting_id: painting.id,
        bidder_name: name,
        bidder_email: email,
        amount: amount
      })

    if (bidError) {
      setError("Failed to place bid. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Update painting current bid
    await supabase
      .from("paintings")
      .update({ current_bid: amount })
      .eq("id", painting.id)

    setIsSubmitting(false)
    setBidSuccess(true)
    onBidPlaced()
    
    // Close after showing success message
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  return (
    <div 
      className="bg-white p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {bidSuccess ? (
        <div className="text-center py-8">
          <p className="text-xl font-bold text-sky-500 mb-4">Thanks!</p>
          <p className="text-gray-600">We will send you an email to arrange payment if you win :)</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">{painting.title}</h2>
          <p className="text-gray-600 mb-4">by {painting.artist}</p>
          <p className="text-lg mb-4">Current bid: <strong>£{painting.current_bid.toFixed(2)}</strong></p>
          
          <p className="text-sm text-gray-500 mb-4 italic">All the winning bids get split equally between the artists</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 px-3 py-2 w-full"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 px-3 py-2 w-full"
            />
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Your Bid (min £{minBid.toFixed(2)})</label>
              <input
                type="number"
                min={minBid}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="border border-gray-300 px-3 py-2 w-full text-lg font-bold"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-300 hover:bg-sky-400 text-white font-bold py-3 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Placing Bid..." : `Place Bid - £${amount.toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default PaintingsCarousel
