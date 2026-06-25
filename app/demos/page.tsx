"use client"

import { useMemo, useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { albums, findAlbum, defaultTheme, type Album, type AlbumTheme } from "@/lib/albums"
import { usePlayer } from "@/hooks/use-player"
import { GradientField } from "@/components/gradient-field"
import dynamic from "next/dynamic"
import { FloatingPlayer } from "@/components/floating-player"
import { Search, X } from "lucide-react"

const OrbScene = dynamic(
  () => import("@/components/orb-scene").then((m) => ({ default: m.OrbScene })),
  { ssr: false },
)

function trackTheme(base: AlbumTheme, trackIndex: number): AlbumTheme {
  if (trackIndex === 0) return base
  const nodes = [...base.nodes]
  const rotated = [...nodes.slice(trackIndex % nodes.length), ...nodes.slice(0, trackIndex % nodes.length)]
  return { ...base, nodes: rotated }
}

function RangaDemos() {
  const { state, playTrack, toggle, next, prev, seek, setVolume } = usePlayer()
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playerVisible, setPlayerVisible] = useState(false)
  const [search, setSearch] = useState("")
  const [visitedTrackUrls, setVisitedTrackUrls] = useState<Set<string>>(new Set())
  const prevTrackUrl = useRef<string | null>(null)

  // Stable ref to playTrack — used in the one-shot session-restore effect
  const playTrackRef = useRef(playTrack)
  useEffect(() => { playTrackRef.current = playTrack }, [playTrack])

  // Visited album IDs — persisted in localStorage so grey state survives refresh
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const stored = localStorage.getItem("ranga-visited")
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch { return new Set() }
  })

  const markVisited = useCallback((id: string) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set([...prev, id])
      try { localStorage.setItem("ranga-visited", JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  // Session-aware URL restore: on a fresh navigation (shared link) restore album+track from
  // URL params, but NOT on browser refresh — sessionStorage flag tells them apart.
  useEffect(() => {
    const wasHere = sessionStorage.getItem("ranga-demos-session")
    sessionStorage.setItem("ranga-demos-session", "1")
    if (wasHere) return

    const params = new URLSearchParams(window.location.search)
    const collection = params.get("collection")
    const trackParam = params.get("track")
    if (!collection) return

    const album = findAlbum(collection)
    if (!album) return

    setSelectedId(album.id)
    markVisited(album.id)

    const trackIdx = trackParam !== null ? parseInt(trackParam) : 0
    if (!isNaN(trackIdx) && album.tracks[trackIdx]) {
      setPlayerVisible(true)
      playTrackRef.current(album.id, trackIdx)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markVisited])

  // Keep URL in sync with the currently selected album and playing track
  useEffect(() => {
    if (!selectedId) return
    const hasTrack = state.album?.id === selectedId && state.track != null
    const trackPart = hasTrack ? `&track=${state.trackIndex}` : ""
    router.replace(`/demos?collection=${selectedId}${trackPart}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, state.album?.id, state.trackIndex])

  // Sync scene when the player auto-advances to a new album between tracks
  useEffect(() => {
    const newId = state.album?.id
    if (!newId || newId === selectedId) return
    setSelectedId(newId)
    markVisited(newId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.album?.id])

  // Mark track URL as visited when the player moves on
  useEffect(() => {
    const url = state.track?.url ?? null
    if (prevTrackUrl.current && prevTrackUrl.current !== url) {
      setVisitedTrackUrls((s) => new Set([...s, prevTrackUrl.current!]))
    }
    prevTrackUrl.current = url
  }, [state.track?.url])

  const theme = useMemo(() => {
    const base = findAlbum(selectedId)?.theme ?? defaultTheme
    return trackTheme(base, state.trackIndex)
  }, [selectedId, state.trackIndex])

  const filteredAlbums = useMemo(() => {
    if (!search.trim()) return albums
    const q = search.toLowerCase()
    return albums.filter((a) => a.title.toLowerCase().includes(q))
  }, [search])

  // Clear selection when the selected album is filtered out by search
  useEffect(() => {
    if (selectedId && !filteredAlbums.find((a) => a.id === selectedId)) {
      setSelectedId(null)
    }
  }, [filteredAlbums, selectedId])

  const handleSelectAlbum = (id: string | null) => {
    if (id === null) {
      setSelectedId(null)
      router.replace("/demos", { scroll: false })
      return
    }
    if (id === selectedId) {
      if (state.album?.id === id && state.track) {
        toggle()
      } else {
        setPlayerVisible(true)
        playTrack(id, 0)
      }
      return
    }
    markVisited(id)
    setSelectedId(id)
    // Auto-play track 0 whenever the user enters a new album
    setPlayerVisible(true)
    playTrack(id, 0)
  }

  const handleSelectTrack = (album: Album, index: number) => {
    setPlayerVisible(true)
    playTrack(album.id, index)
  }

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ color: theme.ink }}>
      <GradientField colors={theme.nodes} base={theme.base} energy={state.energy} />

      <OrbScene
        albums={filteredAlbums}
        selectedId={selectedId}
        onSelectAlbum={handleSelectAlbum}
        currentUrl={state.track?.url ?? null}
        onSelectTrack={handleSelectTrack}
        isPlaying={state.isPlaying}
        visitedIds={visitedIds}
        visitedTrackUrls={visitedTrackUrls}
      />

      {/* Minimal search pill — fixed top-centre */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Search className="h-3 w-3 shrink-0" style={{ color: "rgba(0,0,0,0.3)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search"
          className="bg-transparent text-xs outline-none placeholder:text-black/30 w-14"
          style={{ color: "#0a0a0e" }}
        />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Clear search">
            <X className="h-3 w-3" style={{ color: "rgba(0,0,0,0.4)" }} />
          </button>
        )}
      </div>

      {playerVisible && (
        <FloatingPlayer
          state={state}
          theme={theme}
          onToggle={toggle}
          onNext={next}
          onPrev={prev}
          onSeek={seek}
          onVolume={setVolume}
          onClose={() => setPlayerVisible(false)}
        />
      )}
    </main>
  )
}

export default function Page() {
  return (
    <Suspense>
      <RangaDemos />
    </Suspense>
  )
}
