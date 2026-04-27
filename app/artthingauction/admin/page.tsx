"use client"

import { useEffect, useState } from "react"
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
  current_bid: number
}

export default function AdminExportPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  async function fetchData() {
    const supabase = createClient()
    
    // Fetch paintings
    const { data: paintingsData } = await supabase
      .from("paintings")
      .select("id, title, artist, current_bid")
      .order("id")
    
    if (paintingsData) {
      setPaintings(paintingsData)
    }

    // Fetch all bids with painting info
    const { data: bidsData } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (bidsData && paintingsData) {
      const bidsWithPaintings = bidsData.map(bid => {
        const painting = paintingsData.find(p => p.id === bid.painting_id)
        return {
          ...bid,
          painting_title: painting?.title || "Unknown",
          painting_artist: painting?.artist || "Unknown"
        }
      })
      setBids(bidsWithPaintings)
    }

    setLoading(false)
  }

  function exportToCSV() {
    if (bids.length === 0) return

    const headers = ["Painting", "Artist", "Bidder Name", "Bidder Email", "Amount (£)", "Date"]
    const rows = bids.map(bid => [
      bid.painting_title,
      bid.painting_artist,
      bid.bidder_name,
      bid.bidder_email,
      bid.amount.toString(),
      new Date(bid.created_at).toLocaleString()
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `egg-art-bids-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportWinnersCSV() {
    if (paintings.length === 0) return

    // Get highest bid for each painting
    const winners = paintings.map(painting => {
      const paintingBids = bids.filter(b => b.painting_id === painting.id)
      const highestBid = paintingBids.length > 0 
        ? paintingBids.reduce((max, b) => b.amount > max.amount ? b : max, paintingBids[0])
        : null
      
      return {
        painting: painting.title,
        artist: painting.artist,
        winner_name: highestBid?.bidder_name || "No bids",
        winner_email: highestBid?.bidder_email || "-",
        winning_bid: highestBid?.amount || 0
      }
    })

    const headers = ["Painting", "Artist", "Winner Name", "Winner Email", "Winning Bid (£)"]
    const rows = winners.map(w => [
      w.painting,
      w.artist,
      w.winner_name,
      w.winner_email,
      w.winning_bid.toString()
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `egg-art-winners-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "Arial, sans-serif" }}>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 px-3 py-2 w-full"
          />
          {passwordError && <p className="text-red-500 text-sm">Incorrect password</p>}
          <button
            type="submit"
            className="bg-sky-300 hover:bg-sky-400 text-white font-bold py-2 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "Arial, sans-serif" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Egg Art Auction - Admin</h1>
        
        {/* Export buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-sky-300 hover:bg-sky-400 text-white font-bold rounded transition-all"
          >
            Export All Bids (CSV)
          </button>
          <button
            onClick={exportWinnersCSV}
            className="px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-bold rounded transition-all"
          >
            Export Winners (CSV)
          </button>
        </div>

        {/* Summary */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h2 className="font-bold mb-2">Summary</h2>
          <p>Total Paintings: {paintings.length}</p>
          <p>Total Bids: {bids.length}</p>
          <p>Total Value: £{paintings.reduce((sum, p) => sum + p.current_bid, 0).toFixed(2)}</p>
        </div>

        {/* Paintings with highest bids */}
        <h2 className="text-xl font-bold mb-4">Current Highest Bids</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Painting</th>
                <th className="border p-2 text-left">Artist</th>
                <th className="border p-2 text-right">Current Bid</th>
              </tr>
            </thead>
            <tbody>
              {paintings.map(painting => (
                <tr key={painting.id}>
                  <td className="border p-2">{painting.title}</td>
                  <td className="border p-2">{painting.artist}</td>
                  <td className="border p-2 text-right font-bold">£{painting.current_bid.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* All bids */}
        <h2 className="text-xl font-bold mb-4">All Bids ({bids.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Painting</th>
                <th className="border p-2 text-left">Bidder</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-right">Amount</th>
                <th className="border p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {bids.map(bid => (
                <tr key={bid.id}>
                  <td className="border p-2">{bid.painting_title}</td>
                  <td className="border p-2">{bid.bidder_name}</td>
                  <td className="border p-2">{bid.bidder_email}</td>
                  <td className="border p-2 text-right font-bold">£{bid.amount.toFixed(2)}</td>
                  <td className="border p-2 text-gray-500">
                    {new Date(bid.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bids.length === 0 && (
          <p className="text-gray-500 text-center py-8">No bids yet</p>
        )}

        {/* Back link */}
        <div className="mt-8">
          <a href="/artthingauction" className="text-sky-500 hover:underline">
            Back to Auction
          </a>
        </div>
      </div>
    </div>
  )
}
