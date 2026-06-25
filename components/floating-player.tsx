"use client"

import { useEffect, useRef, useState } from "react"
import type { AlbumTheme } from "@/lib/albums"
import type { PlayerState } from "@/hooks/use-player"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function FloatingPlayer({
  state,
  theme,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  onVolume,
}: {
  state: PlayerState
  theme: AlbumTheme
  onToggle: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (t: number) => void
  onVolume: (v: number) => void
  onClose: () => void
}) {
  const { track, album, isPlaying, currentTime, duration, volume, loading } = state
  const [expanded, setExpanded] = useState(false)
  const accent = theme.nodes?.[0] ?? "#555"
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const prevTrack = useRef(track?.url)
  useEffect(() => {
    if (track?.url && track.url !== prevTrack.current) {
      setExpanded(true)
      prevTrack.current = track.url
    }
  }, [track?.url])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(24px)",
          borderTop: `1.5px solid ${accent}44`,
          borderLeft: `1px solid rgba(0,0,0,0.06)`,
          borderRight: `1px solid rgba(0,0,0,0.06)`,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
          color: "#0a0a0e",
        }}
      >
        {/* Expanded section — slides down from bottom bar */}
        <div
          style={{
            maxHeight: expanded ? "160px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="flex flex-col gap-3 px-4 pb-2 pt-3">
            <div className="text-center leading-tight">
              <p
                className={`truncate text-sm font-medium ${album?.theme.display ?? ""}`}
                style={{ color: "#0a0a0e" }}
              >
                {track?.name ?? ""}
              </p>
              <p className="mt-0.5 truncate text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
                {album?.title ?? ""}
              </p>
            </div>

            <div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                aria-label="Seek"
                className="player-range player-range--tall w-full"
                style={{ ["--p" as string]: `${progress}%`, ["--ink" as string]: accent }}
              />
              <div
                className="flex justify-between text-[10px] tabular-nums mt-1"
                style={{ color: "rgba(0,0,0,0.4)" }}
              >
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onVolume(volume > 0 ? 0 : 0.8)}
                aria-label={volume > 0 ? "Mute" : "Unmute"}
                style={{ color: "rgba(0,0,0,0.4)" }}
                className="shrink-0"
              >
                {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => onVolume(parseFloat(e.target.value))}
                aria-label="Volume"
                className="player-range flex-1"
                style={{ ["--p" as string]: `${volume * 100}%`, ["--ink" as string]: accent }}
              />
            </div>
          </div>
        </div>

        {/* Always-visible mini bar */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={onPrev}
            aria-label="Previous"
            style={{ color: "rgba(0,0,0,0.4)" }}
            className="shrink-0 p-1 transition-opacity hover:opacity-70"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={onToggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
            style={{ background: accent, color: "#fff" }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>

          <button
            onClick={onNext}
            aria-label="Next"
            style={{ color: "rgba(0,0,0,0.4)" }}
            className="shrink-0 p-1 transition-opacity hover:opacity-70"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <span
              className={`truncate text-sm font-medium ${album?.theme.display ?? ""}`}
              style={{ color: "#0a0a0e" }}
            >
              {track?.name ?? "nothing playing"}
            </span>
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse" : "Expand"}
            style={{ color: "rgba(0,0,0,0.35)" }}
            className="shrink-0 p-1 transition-opacity hover:opacity-70"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
