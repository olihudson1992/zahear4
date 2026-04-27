"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Painting {
  id: number
  title: string
  artist: string
  image_url: string
  starting_price: number
  current_bid: number
}

// Intro animation images - Bunny CDN
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

// Intro Animation Component
function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<"loading" | "static" | "spinning">("loading")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = Math.min(window.innerWidth - 32, window.innerHeight - 100) * 0.85
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    const numSlices = images.length
    const sliceAngle = (2 * Math.PI) / numSlices

    let loadedImages = 0
    const imageElements: HTMLImageElement[] = []
    const sliceOffsets: number[] = []
    
    for (let i = 0; i < numSlices; i++) {
      sliceOffsets[i] = i * sliceAngle
    }

    images.forEach((src, index) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageElements[index] = img
        loadedImages++
        if (loadedImages === images.length) {
          drawPieChart()
          setPhase("static")
          // After 2 seconds, start spinning
          setTimeout(() => {
            setPhase("spinning")
            startSpinning()
          }, 2000)
        }
      }
      img.onerror = () => {
        loadedImages++
        if (loadedImages === images.length) {
          drawPieChart()
          setPhase("static")
          setTimeout(() => {
            setPhase("spinning")
            startSpinning()
          }, 2000)
        }
      }
      img.src = src
    })

    let animationId: number
    let spinSpeed = 0
    let spinTime = 0
    const spinDuration = 3000 // 3 seconds

    function startSpinning() {
      const startTime = Date.now()
      
      function spin() {
        spinTime = Date.now() - startTime
        
        if (spinTime < spinDuration) {
          // Ease in and out
          const progress = spinTime / spinDuration
          const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
          
          spinSpeed = 0.15 * Math.sin(progress * Math.PI)
          
          for (let i = 0; i < numSlices; i++) {
            sliceOffsets[i] += spinSpeed
          }
          
          drawPieChart()
          animationId = requestAnimationFrame(spin)
        } else {
          // Spin complete, transition to carousel
          cancelAnimationFrame(animationId)
          onComplete()
        }
      }
      
      spin()
    }

    function drawPieChart() {
      if (!ctx) return

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)

      for (let i = 0; i < numSlices; i++) {
        const startAngle = sliceOffsets[i] - Math.PI / 2
        const endAngle = startAngle + sliceAngle
        const midAngle = (startAngle + endAngle) / 2

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.clip()

        const img = imageElements[i]
        if (img) {
          const zoomFactor = 1.5
          const imgSize = Math.min(img.width, img.height)
          const scale = (radius * 2.2 * zoomFactor) / imgSize

          const sliceDistance = radius * 0.5
          const sliceCenterX = centerX + Math.cos(midAngle) * sliceDistance
          const sliceCenterY = centerY + Math.sin(midAngle) * sliceDistance

          const offsetX = sliceCenterX - (img.width * scale) / 2
          const offsetY = sliceCenterY - (img.height * scale) / 2

          ctx.drawImage(img, offsetX, offsetY, img.width * scale, img.height * scale)
        }

        ctx.restore()
      }
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [onComplete])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full" />
      {phase === "loading" && (
        <p className="mt-4 text-gray-400" style={{ fontFamily: "Arial, sans-serif" }}>Loading...</p>
      )}
    </div>
  )
}

// Bid Form Component
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
      setError(`Minimum bid is £${minBid}`)
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
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
    </div>
  )
}

// Carousel Component
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
    const { data } = await supabase
      .from("paintings")
      .select("*")
      .order("id")
    
    if (data) {
      setPaintings(data)
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

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.scrollWidth / paintings.length
      carouselRef.current.scrollTo({
        left: itemWidth * index,
        behavior: "smooth"
      })
    }
  }

  const handleScroll = () => {
    if (carouselRef.current && paintings.length > 0) {
      const itemWidth = carouselRef.current.scrollWidth / paintings.length
      const newIndex = Math.round(carouselRef.current.scrollLeft / itemWidth)
      setCurrentIndex(newIndex)
    }
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />
      
      {/* Header */}
      <div className="text-center py-2 px-4">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
        <p className="text-gray-500 text-xs">Tap a painting to bid</p>
      </div>

      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {paintings.map((painting, index) => (
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

      {/* Bid Form Modal */}
      {selectedPainting && (
        <BidForm
          painting={selectedPainting}
          onClose={() => setSelectedPainting(null)}
          onBidPlaced={fetchPaintings}
        />
      )}
    </div>
  )
}

// Main App
export default function EggArtAuction() {
  const [showIntro, setShowIntro] = useState(true)

  return showIntro ? (
    <IntroAnimation onComplete={() => setShowIntro(false)} />
  ) : (
    <PaintingsCarousel />
  )
}
