"use client"

import { useEffect, useRef, useState } from "react"

const images = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSCF5214.JPG-dDBShj7pp5InEbNnGM5VySkCpmVwfP.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anna%20%26b%20Robby%20-%20Tiny%20Distraction.JPG-JAskMCW5KmJX7AgCMeodHVbjrGDWIw.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Elleyna%20-%20Trukish%20Cafe.JPG-SREi1nSog1KeDU8mpDNmmnwburm0pj.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Joanne%20-%20table%20top%20view.JPG-BC3YQhLnEvsdtz6ad2zOl8Fnupvjyf.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AJ%20-%20Krakatoaz%20CC.JPG-EyWB10kUpQQqagM1y0nt4hYmj3k4nd.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Isaac%20-%20Animal%20Instinct.JPG-vhAmmISQTQU6AZe15jZLfCvLEiHiko.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Eva%20-%20.JPG-nrcddJjvlb8GBWucDqVpztkz3r5v7l.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hattie%20-%20unknown.JPG-VRQ6QbmdoAsakyuUgG4QqAysmEKLRA.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Eliza%20-%20Issac.JPG-Pxky8qQee03epE9RfoTIQDUDyLUBsC.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSCF5198.JPG-axyJzQxwjmCvI9VP5u5RI10QqeBIj1.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSCF5208.JPG-RZGBzMNoTdNIHymQOnoh8QghCrMzSy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSCF5195.JPG-rc4Dt603iOL3dprnwYBi8CiaBB3R5d.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHLOE%20-%20Fuzanglong.JPG-24bRteW18GWubJoS5G7KqOGBfz5zKN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Darcie%20-%20Bag%20Piss.JPG-iixhRwHCSVC0xDAE59A4pYgm9TkLSH.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Evelyn%20-%20I%20dont%20know%20%28wink%20wink%29.JPG-6aJs1uDSv7rVykUl4XCSMlL84vDAGf.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Deb%20-%20untitled.JPG-OmEXzk3PDPTNFXHgiHyfCidYUBVMRd.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Harry%20-%20Where%27s%20the%20Whale.JPG-Gwo9tqHSbjYbc3FfjcBJg2Ea1tkzrc.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Brad%20-%20Mr%20Gonk.JPG-Km4roKsoKmD8rSFRep1j75KQV4vyv8.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Joanne%20-%20untitled.JPG-P4Ei55U7wyLyXdTV0humDY6M9tqs4P.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tom%20-%20Scratch.JPG-K1hSV5MLELIgkmzK0h69r5YTq3ahWV.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Marths%20maybe%20-%20I%20can%27t%203.JPG-Dc5jCgBSDdCTAvzBNUQxBRnrtUfnfO.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tilda%20-%20Unknown.JPG-b5CoANUYvIyxXuSr92KdedgDeDCbuU.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lynn%20-%20The%20Sigh.JPG-MJ8j9MBmDYsV6jbFddSPXvrtRxbL0I.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tom%20-%20Revolving%20faces.JPG-7k9DqJaSNgGQBTCiU4HzmHFOrUm2sY.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rose%20-%20Running%20to%20the%20chapel%20and%20talking%20to%20the%20aliens.JPG-u5Vx3XE6ysgcEUdhSgViEeAOirAC8m.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meta%20-%20Metamorphosis.JPG-7IKOVaE58ZiEpFqFzotVYDnuLYo1Oz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OLI%20-%20PANTOMINE.JPG-T0XVAnlFAtru8TGjLZwpmBI8IoShyT.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Taco%20-%20Unknown.JPG-FybhIymdKmSVqsC833nxTDLsd5vRpr.jpeg",
]

export default function PieChartArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [screenState, setScreenState] = useState<"pie" | "title" | "allin">("pie")

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

  const handleScreenClick = () => {
    if (screenState === "pie") {
      setScreenState("title")
    } else if (screenState === "title") {
      setScreenState("allin")
    } else {
      setScreenState("pie")
    }
  }

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
    
    type SliceType = 0 | 1 | 2 | 3
    const sliceTypes: SliceType[] = []
    const blendModes: GlobalCompositeOperation[] = ["lighten", "darken", "difference", "exclusion"]
    
    type InteractionType = 0 | 1 | 2 | 3
    const interactionTypes: InteractionType[] = []
    
    const sliceSpeeds: number[] = []
    const sliceOffsets: number[] = []
    const sliceMass: number[] = []
    
    for (let i = 0; i < numSlices; i++) {
      sliceSpeeds[i] = (Math.random() - 0.5) * 0.015
      sliceOffsets[i] = i * sliceAngle
      sliceTypes[i] = (i % 4) as SliceType
      interactionTypes[i] = Math.floor(Math.random() * 4) as InteractionType
      sliceMass[i] = 0.5 + Math.random() * 1.5
    }

    images.forEach((src, index) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageElements[index] = img
        loadedImages++

        if (loadedImages === images.length) {
          // Draw initial static pie chart
          drawPieChart()
          // Start animation after 5 seconds
          setTimeout(() => {
            animate()
          }, 5000)
        }
      }
      img.onerror = () => {
        loadedImages++
        if (loadedImages === images.length) {
          drawPieChart()
          setTimeout(() => {
            animate()
          }, 5000)
        }
      }
      img.src = src
    })

    let animationId: number

    function animate() {
      for (let i = 0; i < numSlices; i++) {
        for (let j = 0; j < numSlices; j++) {
          if (i === j) continue
          
          let angleDiff = sliceOffsets[j] - sliceOffsets[i]
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
          
          const distance = Math.abs(angleDiff)
          
          if (distance < sliceAngle * 2.5) {
            const influence = (1 - distance / (sliceAngle * 2.5)) * 0.0003 * sliceMass[j]
            const direction = angleDiff > 0 ? 1 : -1
            
            switch (interactionTypes[j]) {
              case 0:
                sliceSpeeds[i] += influence * direction
                break
              case 1:
                sliceSpeeds[i] -= influence * direction * 1.5
                break
              case 2:
                sliceSpeeds[i] *= 1 + influence * 2
                break
              case 3:
                sliceSpeeds[i] *= 1 - influence
                break
            }
          }
        }
        
        sliceSpeeds[i] *= 0.999
        sliceSpeeds[i] = Math.max(-0.05, Math.min(0.05, sliceSpeeds[i]))
        
        if (Math.random() < 0.01) {
          sliceSpeeds[i] += (Math.random() - 0.5) * 0.002
        }
        
        sliceOffsets[i] += sliceSpeeds[i]
      }
      
      drawPieChart()
      animationId = requestAnimationFrame(animate)
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
        ctx.globalCompositeOperation = "source-over"
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

      for (let i = 0; i < numSlices; i++) {
        const startAngle = sliceOffsets[i] - Math.PI / 2
        const endAngle = startAngle + sliceAngle
        const midAngle = (startAngle + endAngle) / 2

        for (let j = 0; j < numSlices; j++) {
          if (i === j) continue
          
          let angleDiff = sliceOffsets[j] - sliceOffsets[i]
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
          
          if (Math.abs(angleDiff) < sliceAngle * 1.2) {
            ctx.save()
            
            ctx.globalCompositeOperation = blendModes[sliceTypes[i]]
            ctx.globalAlpha = 0.4 * (1 - Math.abs(angleDiff) / (sliceAngle * 1.2))
            
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
      }
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <main 
      className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <audio ref={audioRef} src="https://rangatracks.b-cdn.net/ENCHELADER.mp3" loop />
      
      {/* Pie Chart - centered */}
      <canvas 
        ref={canvasRef} 
        className="max-w-full mb-6"
        onClick={handleScreenClick}
      />

      {/* Title Overlay */}
      {screenState === "title" && (
        <a
          href="https://www.eventbrite.com/e/the-egg-art-thing-auction-tickets-1987838265764?aff=ebdssbdestsearch"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="absolute inset-0 bg-white/95 flex items-center justify-center z-20 cursor-pointer"
        >
          <h1 
            className="text-black font-bold text-center leading-none px-4"
            style={{ 
              fontSize: "clamp(3rem, 18vw, 12rem)",
              fontFamily: "Arial, sans-serif"
            }}
          >
            THE EGG<br />ART THING
          </h1>
        </a>
      )}

      {/* All In Overlay */}
      {screenState === "allin" && (
        <div 
          className="absolute inset-0 bg-white/95 flex items-center justify-center z-20 cursor-pointer p-8"
          onClick={handleScreenClick}
        >
          <div className="bg-white p-8 md:p-12 max-w-lg w-full shadow-lg">
            <h2 
              className="text-black font-bold text-center"
              style={{ 
                fontSize: "clamp(2rem, 10vw, 5rem)",
                fontFamily: "Arial, sans-serif"
              }}
            >
              ALL IN
            </h2>
          </div>
        </div>
      )}

      {/* Buttons container - below canvas */}
      <div className="flex flex-col items-center gap-3 mt-4">
        {/* Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
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

        {/* Online Auction Button */}
        <a
          href="https://www.wiiad.world/artthingauction"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-2 bg-sky-300 hover:bg-sky-400 rounded-full text-white text-sm font-bold transition-all shadow-md"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          ONLINE AUCTION
        </a>
      </div>
    </main>
  )
}
