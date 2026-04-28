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
      .select("id, title, artist")
      .order("id")

    const { data: bidsData } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false })

    if (!paintingsData || !bidsData) {
      setLoading(false)
      return
    }

    // 🧠 FIX: compute real highest bid from bids table
    const enrichedPaintings = paintingsData.map(p => {
      const relatedBids = bidsData.filter(b => b.painting_id === p.id)

      const highest = relatedBids.reduce(
        (max, b) => (b.amount > (max?.amount || 0) ? b : max),
        null as Bid | null
      )

      return {
        ...p,
        current_bid: highest?.amount || 1
      }
    })

    const enrichedBids = bidsData.map(bid => {
      const painting = paintingsData.find(p => p.id === bid.painting_id)

      return {
        ...bid,
        painting_title: painting?.title || "Unknown",
        painting_artist: painting?.artist || "Unknown"
      }
    })

    setPaintings(enrichedPaintings)
    setBids(enrichedBids)
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
              <td>£{p.current_bid.toFixed(2)}</td>
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
