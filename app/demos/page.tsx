"use client"

import { useMemo, useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  // Rotate the nodes array so a different colour leads the gradient each track
  const rotated = [...nodes.slice(trackIndex % nodes.length), ...nodes.slice(0, trackIndex % nodes.length)]
  return { ...base, nodes: rotated }
}

function RangaDemos() {
  const { state, playTrack, toggle, next, prev, seek, setVolume } = usePlayer()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playerVisible, setPlayerVisible] = useState(false)

  useEffect(() => {
    const collection = searchParams.get("collection")
    if (collection) {
      const album = findAlbum(collection)
      if (album) setSelectedId(album.id)
    }
  }, [searchParams])

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
    setSelectedId(id)
    router.replace(`/demos?collection=${id}`, { scroll: false })
  }

  const handleSelectTrack = (album: Album, index: number) => {
    setPlayerVisible(true)
    playTrack(album.id, index)
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{ color: theme.ink }}
    >
      <GradientField colors={theme.nodes} base={theme.base} energy={state.energy} />

      <OrbScene
        albums={albums}
        selectedId={selectedId}
        onSelectAlbum={handleSelectAlbum}
        currentUrl={state.track?.url ?? null}
        onSelectTrack={handleSelectTrack}
        isPlaying={state.isPlaying}
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
