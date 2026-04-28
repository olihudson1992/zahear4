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
    setLoading(true)

    // 🔥 ALWAYS get fresh DB state
    const { data: paintingsData, error: pError } = await supabase
      .from("paintings")
      .select("id, title, artist, current_bid")
      .order("id")

    if (pError) console.log("Paintings error:", pError)

    const safePaintings = (paintingsData ?? []).map(p => ({
      ...p,
      current_bid: Number(p.current_bid ?? 0)
    }))

    setPaintings(safePaintings)

    const { data: bidsData, error: bError } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false })

    if (bError) console.log("Bids error:", bError)

    if (bidsData) {
      const enriched = bidsData.map(bid => {
        const painting = safePaintings.find(p => p.id === bid.painting_id)

        return {
          ...bid,
          painting_title: painting?.title || "Unknown",
          painting_artist: painting?.artist || "Unknown"
        }
      })

      setBids(enriched)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    fetchData()

    // 🔥 live refresh so admin always updates
    const interval = setInterval(fetchData, 3000)

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchData])

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

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${c}"`).join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `bids-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  function exportWinnersCSV() {
    const winners = paintings.map(p => {
      const paintingBids = bids.filter(b => b.painting_id === p.id)

      const highest = paintingBids.length
        ? paintingBids.reduce((max, b) => (b.amount > max.amount ? b : max))
        : null

      return [
        p.title,
        p.artist,
        highest?.bidder_name || "No bids",
        highest?.bidder_email || "-",
        highest?.amount?.toString() || "0"
      ]
    })

    const csv = [
      ["Painting", "Artist", "Winner", "Email", "Amount"],
      ...winners
    ]
      .map(r => r.map(c => `"${c}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `winners-${new Date().toISOString().split("T")[0]}.csv`
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

  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={exportToCSV} className="bg-sky-300 px-4 py-2">
          Export Bids
        </button>

        <button onClick={exportWinnersCSV} className="bg-green-400 px-4 py-2">
          Export Winners
        </button>
      </div>

      <h2 className="font-bold mb-2">Highest Bids</h2>

      <table className="w-full border">
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
              <td className="font-bold">£{Number(p.current_bid).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-bold mt-6 mb-2">All Bids</h2>

      <table className="w-full border text-sm">
        <tbody>
          {bids.map(b => (
            <tr key={b.id}>
              <td>{b.painting_title}</td>
              <td>{b.bidder_name}</td>
              <td>£{b.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
