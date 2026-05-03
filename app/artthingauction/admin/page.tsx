'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Bid {
  id: number
  painting_id: number
  bidder_name: string
  bidder_email: string
  amount: number
  created_at: string
  painting_title?: string
  painting_artist?: string
}

interface Painting {
  id: number
  title: string
  artist: string
  image_url?: string
}

export default function AdminExportPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)

  const supabase = createClient()
  const correctPassword = "onlythewayitgoes"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      setIsAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const fetchData = useCallback(async () => {
    const { data: paintingsData } = await supabase
      .from("paintings")
      .select("id, title, artist, image_url")
      .order("id")

    const { data: bidsData } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false })

    if (paintingsData) setPaintings(paintingsData)
    if (bidsData) setBids(bidsData as Bid[])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!isAuthenticated) return

    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 2000)

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchData])

  const excludedPaintingKeys = ["DSCF5198"]

  const shouldExcludePainting = (painting: Painting) =>
    !!painting.image_url && excludedPaintingKeys.some(key => painting.image_url.includes(key))

  const visiblePaintings = paintings.filter(p => !shouldExcludePainting(p))
  const visiblePaintingIds = new Set(visiblePaintings.map(p => p.id))
  const visibleBids = bids.filter(b => visiblePaintingIds.has(b.painting_id))

  function getHighestBid(paintingId: number) {
    const paintingBids = visibleBids.filter(b => b.painting_id === paintingId)
    if (paintingBids.length === 0) return 0
    return Math.max(...paintingBids.map(b => b.amount))
  }

  function getWinner(paintingId: number) {
    const paintingBids = visibleBids.filter(b => b.painting_id === paintingId)
    if (paintingBids.length === 0) return null
    return paintingBids.reduce((max, b) => b.amount > max.amount ? b : max)
  }

  function exportToCSV() {
    const headers = ["Painting", "Artist", "Bidder", "Email", "Amount", "Date"]

    const rows = visibleBids.map(b => [
      b.painting_title,
      b.painting_artist,
      b.bidder_name,
      b.bidder_email,
      b.amount,
      new Date(b.created_at).toLocaleString()
    ])

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${c}"`).join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "bids.csv"
    a.click()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-2"
          />

          {passwordError && <p className="text-red-500">Wrong password</p>}

          <button className="bg-sky-300 p-2">Login</button>
        </form>
      </div>
    )
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>

      <button onClick={exportToCSV} className="bg-sky-300 px-4 py-2 mb-6">
        Export CSV
      </button>

      <h2 className="font-bold mb-2">Highest Bids (LIVE CALCULATED)</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {visiblePaintings.map(p => {
          const highest = getHighestBid(p.id)
          const winner = getWinner(p.id)

          return (
            <div key={p.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="font-bold text-lg">{p.title || `Painting ${p.id}`}</div>
              <div className="text-sm text-gray-600 mb-3">{p.artist || `ID ${p.id}`}</div>

              <div className="text-sm mb-1">Current bid:</div>
              <div className="text-xl font-semibold">£{highest.toFixed(2)}</div>

              {winner ? (
                <div className="mt-3 text-sm space-y-1">
                  <div><span className="font-semibold">Bidder:</span> {winner.bidder_name}</div>
                  <div><span className="font-semibold">Email:</span> {winner.bidder_email}</div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-500">No bids yet</div>
              )}
            </div>
          )
        })}
      </div>

      <h2 className="font-bold mt-6 mb-2">All Bids</h2>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Painting</th>
            <th className="text-left p-2">Bidder</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {visibleBids.map(b => (
            <tr key={b.id} className="border-t">
              <td className="p-2">{b.painting_title || `ID ${b.painting_id}`}</td>
              <td className="p-2">{b.bidder_name}</td>
              <td className="p-2">{b.bidder_email}</td>
              <td className="p-2">£{b.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
