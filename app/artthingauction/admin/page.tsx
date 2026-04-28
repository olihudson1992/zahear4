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
  current_bid: number
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
      .select("id, title, artist, current_bid")
      .order("id")

    const { data: bidsData } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false })

    if (paintingsData) setPaintings(paintingsData)

    if (bidsData && paintingsData) {
      const enriched = bidsData.map(bid => {
        const painting = paintingsData.find(p => p.id === bid.painting_id)

        return {
          ...bid,
          painting_title: painting?.title || "Unknown",
          painting_artist: painting?.artist || "Unknown"
        }
      })

      setBids(enriched)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!isAuthenticated) return

    fetchData()

    // 🔥 live refresh every 2s
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)

  }, [isAuthenticated, fetchData])

  function exportToCSV() {
    const headers = ["Painting", "Artist", "Bidder", "Email", "Amount", "Date"]

    const rows = bids.map(b => [
      b.painting_title,
      b.painting_artist,
      b.bidder_name,
      b.bidder_email,
      b.amount.toString(),
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

      <h2 className="font-bold mb-2">Current Bids</h2>

      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th>Painting</th>
            <th>Artist</th>
            <th>Current Bid</th>
          </tr>
        </thead>
        <tbody>
          {paintings.map(p => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.artist}</td>
              <td>£{p.current_bid.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-bold mb-2">All Bids</h2>

      <table className="w-full border text-sm">
        <tbody>
          {bids.map(b => (
            <tr key={b.id}>
              <td>{b.painting_title}</td>
              <td>{b.bidder_name}</td>
              <td>£{b.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
