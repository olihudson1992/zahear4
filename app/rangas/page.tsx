"use client"

import { useMemo, useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { albums, findAlbum, defaultTheme, type Album, type AlbumTheme } from "@/lib/albums"
import { usePlayer } from "@/hooks/use-player"
import { GradientField } from "@/components/gradient-field"
import dynamic from "next/dynamic"
import { FloatingPlayer } from "@/components/floating-player"
import { X } from "lucide-react"
import { WizardPrompt } from "@/components/wizard-prompt"
import { SimpleView } from "@/components/simple-view"

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
  const [simpleMode, setSimpleMode] = useState(false)
  const [greetingDismissed, setGreetingDismissed] = useState(false)
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
    router.replace(`/rangas?collection=${selectedId}${trackPart}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, state.album?.id, state.trackIndex])

  // Sync scene when the player auto-advances (same-album or cross-album)
  useEffect(() => {
    const newId = state.album?.id
    if (!newId || newId === selectedId) return
    setSelectedId(newId)
    markVisited(newId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.album?.id, state.trackIndex])

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

  // Show farewell message when every album orb has gone grey
  const allVisited = albums.length > 0 && albums.every((a) => visitedIds.has(a.id))
  const accent = theme.nodes?.[0] ?? "#555"

  const handleSelectAlbum = (id: string | null) => {
    if (id === null) {
      setSelectedId(null)
      router.replace("/rangas", { scroll: false })
      return
    }
    if (id === selectedId) {
      // Tapping the current album: toggle only if we're playing from it
      if (state.album?.id === id && state.track) {
        toggle()
      }
      return
    }
    markVisited(id)
    setSelectedId(id)
    setPlayerVisible(true)
    // Don't interrupt a track already playing — let the user pick one
    if (!state.track) {
      playTrack(id, 0)
    }
  }

  const handleSelectTrack = (album: Album, index: number) => {
    setPlayerVisible(true)
    playTrack(album.id, index)
  }

  const handleJumpToTrack = useCallback((album: Album, index: number) => {
    markVisited(album.id)
    setSelectedId(album.id)
    setPlayerVisible(true)
    playTrack(album.id, index)
  }, [markVisited, playTrack])

  if (simpleMode) {
    return (
      <SimpleView
        albums={albums}
        state={state}
        theme={theme}
        onJumpToTrack={handleJumpToTrack}
        onToggle={toggle}
        onNext={next}
        onPrev={prev}
        onSeek={seek}
        onVolume={setVolume}
        onExit={() => setSimpleMode(false)}
      />
    )
  }

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ color: theme.ink }}>
      <GradientField colors={theme.nodes} base={theme.base} energy={state.energy} />

      {/* Fallback for users whose browser can't render WebGL */}
      <button
        onClick={() => setSimpleMode(true)}
        className="fixed right-3 top-3 z-30 rounded-full px-2.5 py-1 text-xs transition-opacity hover:opacity-80"
        style={{ background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
        aria-label="Simple mode"
      >
        ≡
      </button>

      <OrbScene
        albums={albums}
        selectedId={selectedId}
        onSelectAlbum={handleSelectAlbum}
        currentUrl={state.track?.url ?? null}
        onSelectTrack={handleSelectTrack}
        isPlaying={state.isPlaying}
        visitedIds={visitedIds}
        visitedTrackUrls={visitedTrackUrls}
        onJumpToTrack={handleJumpToTrack}
        onActivateSimpleMode={() => setSimpleMode(true)}
      />

      {/* Farewell card — shows once all album orbs have gone grey */}
      {allVisited && !greetingDismissed && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-6">
          <div
            className="pointer-events-auto w-full max-w-sm rounded-2xl p-5 shadow-xl"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${accent}22`,
              color: "#0a0a0e",
            }}
          >
            <button
              onClick={() => setGreetingDismissed(true)}
              className="float-right ml-2 text-black/30 hover:text-black/60"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm leading-relaxed text-black/65">
              heyo thanks for listening 👋 if you wanna support the artist there&apos;s some
              stuff on{" "}
              <a
                href="https://rangatanga.bandcamp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: accent }}
              >
                bandcamp
              </a>
              . if you&apos;re a label and fancy curating a ranga release please email oli at{" "}
              <a
                href="mailto:wyrdliverpool@gmail.com"
                className="underline"
                style={{ color: accent }}
              >
                wyrdliverpool@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Brand logos — invert() turns black strokes white; difference blend erases the white bg and inverts the scene beneath */}
      <img
        src="/images/logo-wyrd.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ bottom: 18, left: 18, width: 160, opacity: 0.55, filter: "invert(1)", mixBlendMode: "difference", zIndex: 100 }}
      />
      <img
        src="/images/logo-ranga.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ bottom: 14, right: 16, width: 200, opacity: 0.5, filter: "invert(1)", mixBlendMode: "difference", zIndex: 100 }}
      />

      <WizardPrompt isPlaying={state.isPlaying} />

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
