"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  X,
  Link2,
  Check,
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
  const [infoOpen, setInfoOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])
  const accent = theme.nodes?.[0] ?? "#555"
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const prevTrack = useRef(track?.url)
  useEffect(() => {
    if (track?.url && track.url !== prevTrack.current) {
      setExpanded(true)
      setInfoOpen(false)
      prevTrack.current = track.url
    }
  }, [track?.url])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center">
      {/* Info card — appears above the player bar */}
      {infoOpen && album?.description && (
        <div className="w-full max-w-lg px-3 pb-2">
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${accent}33`,
              color: "#0a0a0e",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-base font-semibold leading-tight ${album.theme.display}`}
                style={{ color: accent }}
              >
                {album.title}
              </p>
              <button
                onClick={() => setInfoOpen(false)}
                className="mt-0.5 shrink-0 text-black/30 hover:text-black/60"
                aria-label="Close info"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-black/70">
              {album.description}
              {album.descriptionLink && (
                <>
                  {" "}
                  <a
                    href={album.descriptionLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-70"
                    style={{ color: accent }}
                  >
                    {album.descriptionLink.label}
                  </a>
                  .
                </>
              )}
            </p>
            <p className="mt-2 text-xs text-black/35">all tracks prod by oli aka <span style={{ color: "#f97316" }}>ranga</span></p>
          </div>
        </div>
      )}

      {/* Player bar */}
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
        {/* Expanded section — slides up */}
        <div
          style={{
            maxHeight: expanded ? "160px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="flex flex-col gap-3 px-4 pb-2 pt-3">
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

          {/* Track name — tapping expands the player */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-left"
          >
            <span
              className={`truncate text-sm font-medium ${album?.theme.display ?? ""}`}
              style={{ color: "#0a0a0e" }}
            >
              {track?.name ?? "nothing playing"}
            </span>
          </button>

          {/* ? info button — only shown when album has a description */}
          {album?.description && (
            <button
              onClick={() => setInfoOpen((o) => !o)}
              aria-label="Album info"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform hover:scale-105 active:scale-95"
              style={{
                background: infoOpen ? accent : "rgba(0,0,0,0.07)",
                color: infoOpen ? "#fff" : "rgba(0,0,0,0.5)",
                border: `1px solid ${infoOpen ? accent : "rgba(0,0,0,0.1)"}`,
              }}
            >
              ?
            </button>
          )}

          {/* Copy link button — only shown when something is playing */}
          {track && (
            <button
              onClick={copyLink}
              aria-label="Copy link"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
              style={{
                background: copied ? accent : "rgba(0,0,0,0.07)",
                color: copied ? "#fff" : "rgba(0,0,0,0.5)",
                border: `1px solid ${copied ? accent : "rgba(0,0,0,0.1)"}`,
              }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            </button>
          )}

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
