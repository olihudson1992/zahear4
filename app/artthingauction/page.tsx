'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export default function PaintingsCarousel() {
  const [paintings, setPaintings] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: p } = await supabase.from('paintings').select('*')
      const { data: b } = await supabase.from('bids').select('*')

      if (p) setPaintings(p)
      if (b) setBids(b)
    }

    fetchData()
    const i = setInterval(fetchData, 2000)
    return () => clearInterval(i)
  }, [])

  const getBid = (id: number) => {
    const list = bids.filter(b => b.painting_id === id)
    return list.length ? Math.max(...list.map(b => b.amount)) : 1
  }

  const handleBid = async (e: any) => {
    e.preventDefault()

    const form = new FormData(e.target)

    await supabase.from('bids').insert({
      painting_id: selected.id,
      bidder_name: form.get('name'),
      bidder_email: form.get('email'),
      amount: Number(form.get('amount'))
    })

    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold">THE EGG ART THING</h1>
      </div>

      {/* CAROUSEL */}
      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">

        {paintings.map(p => (
          <div
            key={p.id}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center justify-center min-h-[75vh] p-4"
            onClick={() => setSelected(p)}
          >

            <div className="flex items-center justify-center h-[55vh] w-full">
              <img
                src={p.image_url}
                className={`max-h-full max-w-full object-contain ${
                  p.title === "DSCF5198"
                    ? "rotate-90"
                    : p.title === "DSCF5208"
                    ? "-rotate-90"
                    : p.title === "Tom - Scratch"
                    ? "rotate-180"
                    : ""
                }`}
              />
            </div>

            <div className="text-center mt-3">
              <h2 className="font-bold">
                {p.title === "Tom FM" ? "Tom" : p.title}
              </h2>

              <p className="text-sm text-gray-600">{p.artist}</p>

              <p className="text-sky-500 font-bold mt-1">
                £{getBid(p.id).toFixed(2)}
              </p>
            </div>

          </div>
        ))}

      </div>

      {/* BID MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <form
            onSubmit={handleBid}
            className="bg-white p-5 w-80"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold mb-2">{selected.title}</h2>

            <input name="name" placeholder="Name" className="border w-full p-2 mb-2" required />
            <input name="email" placeholder="Email" className="border w-full p-2 mb-2" required />
            <input name="amount" type="number" className="border w-full p-2 mb-2" required />

            <button className="bg-sky-300 w-full py-2">
              Place Bid
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
