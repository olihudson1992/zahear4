"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

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

  const fetchPaintings = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("paintings")
      .select("*")
      .order("id")

    if (data) setPaintings(data)
  }, [])

  useEffect(() => {
    fetchPaintings()
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
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.scrollWidth / paintings.length
      carouselRef.current.scrollLeft = itemWidth * index
      setCurrentIndex(index)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  // ✅ ONLY ADDITION (safe + minimal)
  const updateLocalBid = (id: string, amount: number) => {
    setPaintings(prev =>
      prev.map(p =>
        p.id === id ? { ...p, current_bid: amount } : p
      )
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />

      {/* HEADER (UNCHANGED) */}
      <div className="text-center py-2 px-4">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-gray-500 text-xs">Tap a painting to bid</p>
      </div>

      {/* CAROUSEL (UNCHANGED) */}
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

      {/* DOTS (UNCHANGED) */}
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

      {/* PLAY BUTTON (UNCHANGED) */}
      <div className="flex flex-col items-center py-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-sky-300 hover:bg-sky-400 rounded-full flex items-center justify-center transition-all shadow-md"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* BID MODAL */}
      {selectedPainting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <BidForm
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            onBidPlaced={(amount: number) => {
              updateLocalBid(selectedPainting.id, amount)
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
  onBidPlaced: (amount: number) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState(
    Number((painting.current_bid + 0.01).toFixed(2))
  )
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const minBid = Number((painting.current_bid + 0.01).toFixed(2))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (amount < minBid) {
      setError(`Minimum bid is £${minBid}`)
      return
    }

    const supabase = createClient()

    const { error: bidError } = await supabase.from("bids").insert({
      painting_id: painting.id,
      bidder_name: name,
      bidder_email: email,
      amount
    })

    if (bidError) {
      setError("Failed to place bid")
      return
    }

    await supabase
      .from("paintings")
      .update({ current_bid: amount })
      .eq("id", painting.id)

    onBidPlaced(amount)
    setSuccess(true)

    setTimeout(onClose, 2000)
  }

  return (
    <div className="bg-white p-6 w-full max-w-sm">
      {success ? (
        <p className="text-center">Thanks!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

          <input
            type="number"
            value={amount}
            min={minBid}
            onChange={e => setAmount(Number(e.target.value))}
          />

          {error && <p className="text-red-500">{error}</p>}

          <button type="submit">Place Bid</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}

export default PaintingsCarousel
