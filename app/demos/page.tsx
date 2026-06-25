"use client"

import { useMemo, useState, useEffect, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import { albums, findAlbum, defaultTheme, type Album, type AlbumTheme } from "@/lib/albums"
import { usePlayer } from "@/hooks/use-player"
import { GradientField } from "@/components/gradient-field"
import dynamic from "next/dynamic"
import { FloatingPlayer } from "@/components/floating-player"

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
  const [visitedTrackUrls, setVisitedTrackUrls] = useState<Set<string>>(new Set())
  const prevTrackUrl = useRef<string | null>(null)

  // Mark a track URL as visited when the player moves away from it
  useEffect(() => {
    const url = state.track?.url ?? null
    if (prevTrackUrl.current && prevTrackUrl.current !== url) {
      setVisitedTrackUrls((s) => new Set([...s, prevTrackUrl.current!]))
    }
    prevTrackUrl.current = url
  }, [state.track?.url])

  // Visited album IDs — persisted in localStorage so grey state survives refresh
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const stored = localStorage.getItem("ranga-visited")
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch { return new Set() }
  })

  const markVisited = (id: string) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set([...prev, id])
      try { localStorage.setItem("ranga-visited", JSON.stringify([...next])) } catch {}
      return next
    })
  }

  // Sync scene when the player auto-advances to a new album between tracks
  useEffect(() => {
    const newId = state.album?.id
    if (!newId || newId === selectedId) return
    setSelectedId(newId)
    markVisited(newId)
    router.replace(`/demos?collection=${newId}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.album?.id])

  const theme = useMemo(() => {
    const base = findAlbum(selectedId)?.theme ?? defaultTheme
    return trackTheme(base, state.trackIndex)
  }, [selectedId, state.trackIndex])

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
    router.replace(`/demos?collection=${id}`, { scroll: false })
  }

  const handleSelectTrack = (album: Album, index: number) => {
    setPlayerVisible(true)
    playTrack(album.id, index)
  }

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ color: theme.ink }}>
      <GradientField colors={theme.nodes} base={theme.base} energy={state.energy} />

      <OrbScene
        albums={albums}
        selectedId={selectedId}
        onSelectAlbum={handleSelectAlbum}
        currentUrl={state.track?.url ?? null}
        onSelectTrack={handleSelectTrack}
        isPlaying={state.isPlaying}
        visitedIds={visitedIds}
        visitedTrackUrls={visitedTrackUrls}
      />

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
