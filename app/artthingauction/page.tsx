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

    if (error) {
      console.log(error)
      return
    }

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

  const updateLocalBid = (id: string, amount: number) => {
    setPaintings(prev =>
      prev.map(p =>
        p.id === id ? { ...p, current_bid: amount } : p
      )
    )
  }

  if (paintings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading paintings...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />

      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
      </div>

      <div
        ref={carouselRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory"
      >
        {paintings.map((painting) => (
          <div
            key={painting.id}
            className="flex-shrink-0 w-full snap-center flex flex-col items-center"
            onClick={() => setSelectedPainting(painting)}
          >
            <img
              src={painting.image_url}
              alt={painting.title}
              className="max-h-[70vh] object-contain"
            />

            <p className="font-bold">{painting.title}</p>
            <p>£{painting.current_bid.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 py-2">
        {paintings.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <button
        onClick={togglePlay}
        className="fixed bottom-4 right-4 bg-sky-300 p-3 rounded-full"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {selectedPainting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

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
