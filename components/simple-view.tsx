"use client"

import { useState } from "react"
import type { Album, AlbumTheme } from "@/lib/albums"
import type { PlayerState } from "@/hooks/use-player"
import { FloatingPlayer } from "@/components/floating-player"

export function SimpleView({
  albums, state, theme,
  onJumpToTrack, onToggle, onNext, onPrev, onSeek, onVolume, onExit,
}: {
  albums: Album[]
  state: PlayerState
  theme: AlbumTheme
  onJumpToTrack: (album: Album, index: number) => void
  onToggle: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (t: number) => void
  onVolume: (v: number) => void
  onExit: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(state.album?.id ?? null)
  const selected = albums.find(a => a.id === selectedId) ?? null
  const accent = theme.nodes?.[0] ?? "#f97316"

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#0a0a0e", color: "#f0f0f5", paddingBottom: 88 }}>
      <div className="mx-auto max-w-xl px-4 py-5">

        <div className="mb-5 flex items-center justify-between">
          <span className="text-base font-semibold" style={{ color: accent }}>ranga demos</span>
          <button
            onClick={onExit}
            className="rounded-full px-3 py-1 text-xs transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            ✦ 3D mode
          </button>
        </div>

        {selected ? (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-3 text-sm transition-opacity hover:opacity-70"
              style={{ color: accent }}
            >
              ← all albums
            </button>
            <h2 className="mb-1 text-lg font-semibold">{selected.title}</h2>
            {selected.description && (
              <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                {selected.description}
              </p>
            )}
            <div className="space-y-1">
              {selected.tracks.map((track, i) => {
                const active = state.track?.url === track.url
                return (
                  <button
                    key={track.url}
                    onClick={() => onJumpToTrack(selected, i)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
                    style={{
                      background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? accent + "44" : "transparent"}`,
                    }}
                  >
                    <span className="w-5 shrink-0 text-center text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {active ? (state.isPlaying ? "▶" : "⏸") : i + 1}
                    </span>
                    <span className="flex-1 text-sm" style={{ color: active ? accent : "#f0f0f5" }}>
                      {track.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {albums.map(album => {
              const playing = state.album?.id === album.id
              return (
                <button
                  key={album.id}
                  onClick={() => setSelectedId(album.id)}
                  className="rounded-xl px-4 py-4 text-left transition-colors hover:brightness-110"
                  style={{
                    background: playing ? `${album.theme.nodes[0]}22` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${playing ? album.theme.nodes[0] + "55" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div className="mb-2 h-1.5 w-6 rounded-full" style={{ background: album.theme.nodes[0] }} />
                  <div className="text-sm font-medium leading-snug" style={{ color: "#f0f0f5" }}>{album.title}</div>
                  <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{album.tracks.length} tracks</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <FloatingPlayer
        state={state} theme={theme}
        onToggle={onToggle} onNext={onNext} onPrev={onPrev}
        onSeek={onSeek} onVolume={onVolume} onClose={() => {}}
      />

      {/* Brand logos */}
      <img src="/images/logo-wyrd.webp" alt="" aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ bottom: 18, left: 18, width: 140, opacity: 0.55, filter: "invert(1)", mixBlendMode: "difference", zIndex: 100 }}
      />
      <img src="/images/logo-ranga.webp" alt="" aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ bottom: 14, right: 16, width: 180, opacity: 0.5, filter: "invert(1)", mixBlendMode: "difference", zIndex: 100 }}
      />
    </div>
  )
}
