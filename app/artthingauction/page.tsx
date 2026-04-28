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

function transformStyle(title: string) {
  const rotate90 = "rotate(90deg)"
  const rotateM90 = "rotate(-90deg)"
  const rotate180 = "rotate(180deg)"

  if (title.includes("Elleyna") || title.includes("Joanne") || title.includes("Tilda")) {
    return rotate90
  }

  if (title.includes("Lynn")) {
    return rotateM90
  }

  if (
    title.includes("Big Alex") ||
    title.includes("Anna") ||
    title.includes("Eliza") ||
    title.includes("Green Blue")
  ) {
    return rotate180
  }

  return "none"
}

function fixText(title: string, artist: string) {
  if (title.toLowerCase().includes("untitled") && artist === "DSCF5214") {
    return { title: "Untitled", artist: "Big Al" }
  }

  if (title.includes("DSCF5198")) {
    return { title: "Who needs skin?", artist: "Bethan" }
  }

  if (title.includes("Green Blue Abstract")) {
    return { title: "Green Blue Abstract", artist: "Tom FM" }
  }

  if (title.includes("Cats")) {
    return { title: "Cats", artist: "Tom" }
  }

  if (title.includes("Elleyna")) {
    return { title, artist: "Elenyar" }
  }

  return { title, artist }
}

export default function Page() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('paintings').select('*')
      if (data) setPaintings(data)
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
      </div>

      <div className="flex-1 flex overflow-x-auto">
        {paintings.map(p => {
          const fixed = fixText(p.title, p.artist)
          const rotation = transformStyle(p.title)

          return (
            <div
              key={p.id}
              className="w-full flex-shrink-0 flex flex-col items-center justify-center"
              onClick={() => setSelectedPainting(p)}
            >
              <div className="flex items-center justify-center h-[60vh] w-full">
                <img
                  src={p.image_url}
                  style={{ transform: rotation }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <h2 className="font-bold mt-2">{fixed.title}</h2>
              <p className="text-sm text-gray-600">{fixed.artist}</p>

              <p>£{p.current_bid.toFixed(2)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
