"use client"

import { useMemo, useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { listenAlbums } from "@/lib/listen-albums"
import { defaultTheme, type Album, type AlbumTheme } from "@/lib/albums"
import { usePlayer } from "@/hooks/use-player"
import { GradientField } from "@/components/gradient-field"
import dynamic from "next/dynamic"
import { FloatingPlayer } from "@/components/floating-player"
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

// ------- Spinning painting card (JS-driven 3D tumble) -------
function SpinningPainting() {
  const [expanded, setExpanded] = useState(false)
  const [face, setFace] = useState<"a" | "b">("a")
  const cardRef = useRef<HTMLDivElement>(null)
  const rxRef   = useRef(10)
  const ryRef   = useRef(0)
  const expandedRef = useRef(false)
  expandedRef.current = expanded

  // Continuous JS tumble — rotates on X and Y at different speeds so the card
  // precesses through 3D space, revealing each painted face as it turns.
  useEffect(() => {
    let frameId: number
    const tick = () => {
      if (!expandedRef.current && cardRef.current) {
        rxRef.current += 0.22
        ryRef.current += 0.58
        cardRef.current.style.transform =
          `rotateX(${rxRef.current}deg) rotateY(${ryRef.current}deg)`
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 10px 50px rgba(0,0,0,0.6)",
  }

  return (
    <>
      <style>{`@keyframes card-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>

      {/* Card — positioned flush right, vertically centred */}
      <div
        style={{
          position: "fixed",
          right: "4vw",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          zIndex: 25,
          pointerEvents: "none",
        }}
      >
        {/* Float wrapper */}
        <div style={{ animation: "card-float 3.8s ease-in-out infinite", perspective: "700px" }}>
          {/* Tumbling card — JS sets transform each frame */}
          <div
            ref={cardRef}
            style={{
              width: "clamp(72px, 9vw, 130px)",
              height: "clamp(96px, 12vw, 173px)",
              position: "relative",
              transformStyle: "preserve-3d",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onClick={() => { setFace("a"); setExpanded(true) }}
          >
            {/* Face A — painting-a.jpg */}
            <div style={faceStyle}>
              <img src="/painting-a.jpg" alt="painting" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            {/* Face B — painting-b.jpg, flipped 180° on Y */}
            <div style={{ ...faceStyle, transform: "rotateY(180deg)" }}>
              <img src="/painting-b.jpg" alt="painting" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {expanded && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setExpanded(false)}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={face === "a" ? "/painting-a.jpg" : "/painting-b.jpg"}
              alt="painting"
              style={{ maxWidth: "88vw", maxHeight: "82vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", display: "block" }}
            />
            <button
              onClick={() => setFace((f) => (f === "a" ? "b" : "a"))}
              style={{
                position: "absolute", bottom: -44, left: "50%", transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)",
                color: "#fff", borderRadius: 20, padding: "6px 20px", fontSize: 13,
                cursor: "pointer", backdropFilter: "blur(8px)", fontFamily: "inherit", letterSpacing: "0.05em",
              }}
            >flip</button>
          </div>
          <button
            onClick={() => setExpanded(false)}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff", borderRadius: "50%", width: 38, height: 38,
              cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit", lineHeight: "1",
            }}
          >×</button>
        </div>
      )}
    </>
  )
}

// ------- Main page -------
function ListenPage() {
  const { state, playTrack, toggle, next, prev, seek, setVolume } = usePlayer(listenAlbums)
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playerVisible, setPlayerVisible] = useState(false)
  const [simpleMode, setSimpleMode] = useState(false)
  const [visitedTrackUrls, setVisitedTrackUrls] = useState<Set<string>>(new Set())
  const prevTrackUrl = useRef<string | null>(null)

  const playTrackRef = useRef(playTrack)
  useEffect(() => { playTrackRef.current = playTrack }, [playTrack])

  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const stored = localStorage.getItem("listen-visited")
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch { return new Set() }
  })

  const markVisited = useCallback((id: string) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set([...prev, id])
      try { localStorage.setItem("listen-visited", JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    const wasHere = sessionStorage.getItem("listen-session")
    sessionStorage.setItem("listen-session", "1")
    if (wasHere) return

    const params = new URLSearchParams(window.location.search)
    const collection = params.get("collection")
    const trackParam = params.get("track")
    if (!collection) return

    const album = listenAlbums.find((a) => a.id === collection)
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

  useEffect(() => {
    if (!selectedId) return
    const hasTrack = state.album?.id === selectedId && state.track != null
    const trackPart = hasTrack ? `&track=${state.trackIndex}` : ""
    router.replace(`/listen?collection=${selectedId}${trackPart}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, state.album?.id, state.trackIndex])

  useEffect(() => {
    const newId = state.album?.id
    if (!newId || newId === selectedId) return
    setSelectedId(newId)
    markVisited(newId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.album?.id, state.trackIndex])

  useEffect(() => {
    const url = state.track?.url ?? null
    if (prevTrackUrl.current && prevTrackUrl.current !== url) {
      setVisitedTrackUrls((s) => new Set([...s, prevTrackUrl.current!]))
    }
    prevTrackUrl.current = url
  }, [state.track?.url])

  const theme = useMemo(() => {
    const base = listenAlbums.find((a) => a.id === selectedId)?.theme ?? defaultTheme
    return trackTheme(base, state.trackIndex)
  }, [selectedId, state.trackIndex])

  const handleSelectAlbum = (id: string | null) => {
    if (id === null) {
      setSelectedId(null)
      router.replace("/listen", { scroll: false })
      return
    }
    if (id === selectedId) {
      if (state.album?.id === id && state.track) toggle()
      return
    }
    markVisited(id)
    setSelectedId(id)
    setPlayerVisible(true)
    if (!state.track) playTrack(id, 0)
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
        albums={listenAlbums}
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

      <SpinningPainting />

      {/* 2D mode button — visible when inside an album so it's always reachable */}
      {selectedId && (
        <button
          onClick={() => setSimpleMode(true)}
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 30,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.04em",
          }}
        >
          2D
        </button>
      )}

      <OrbScene
        albums={listenAlbums}
        selectedId={selectedId}
        onSelectAlbum={handleSelectAlbum}
        currentUrl={state.track?.url ?? null}
        onSelectTrack={handleSelectTrack}
        isPlaying={state.isPlaying}
        visitedIds={visitedIds}
        visitedTrackUrls={visitedTrackUrls}
        onJumpToTrack={handleJumpToTrack}
        onActivateSimpleMode={() => setSimpleMode(true)}
        scifi
        morphOrbs
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
      <ListenPage />
    </Suspense>
  )
}
