"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

const waveformCache = new Map<string, Float32Array>()
let decodeCtx: AudioContext | null = null

async function buildWaveform(url: string, samples = 200): Promise<Float32Array> {
  if (waveformCache.has(url)) return waveformCache.get(url)!

  const res = await fetch(url, { credentials: "omit" })
  const buf = await res.arrayBuffer()

  if (!decodeCtx || decodeCtx.state === "closed") {
    decodeCtx = new AudioContext()
  }
  const decoded = await decodeCtx.decodeAudioData(buf)

  const ch = decoded.getChannelData(0)
  const blockSize = Math.floor(ch.length / samples)
  const data = new Float32Array(samples)

  for (let i = 0; i < samples; i++) {
    let peak = 0
    for (let j = 0; j < blockSize; j++) {
      const v = Math.abs(ch[i * blockSize + j] ?? 0)
      if (v > peak) peak = v
    }
    data[i] = peak
  }

  let maxVal = 0
  for (let i = 0; i < data.length; i++) if (data[i] > maxVal) maxVal = data[i]
  if (maxVal > 0) for (let i = 0; i < data.length; i++) data[i] /= maxVal

  waveformCache.set(url, data)
  return data
}

export function WaveformScrubber({
  url,
  currentTime,
  duration,
  accent,
  onSeek,
  fallback,
}: {
  url: string
  currentTime: number
  duration: number
  accent: string
  onSeek: (t: number) => void
  fallback: ReactNode
}) {
  const [waveform, setWaveform] = useState<Float32Array | null>(() =>
    url ? (waveformCache.get(url) ?? null) : null,
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const SAMPLES = 200

  useEffect(() => {
    if (!url) return
    let cancelled = false
    if (waveformCache.has(url)) {
      setWaveform(waveformCache.get(url)!)
      return
    }
    setWaveform(null)
    buildWaveform(url, SAMPLES)
      .then((data) => { if (!cancelled) setWaveform(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [url])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !waveform) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const progress = duration > 0 ? currentTime / duration : 0
    const splitX = progress * SAMPLES
    const barW = W / SAMPLES
    const midY = H / 2

    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < SAMPLES; i++) {
      const x = i * barW
      const barH = Math.max(2, waveform[i] * H * 0.82)
      ctx.fillStyle = i < splitX ? accent : `${accent}55`
      ctx.fillRect(x + 0.5, midY - barH / 2, Math.max(1, barW - 1.5), barH)
    }
  }, [waveform, currentTime, duration, accent])

  const seek = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !duration) return
    const rect = canvas.getBoundingClientRect()
    onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    seek(e)
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return
    seek(e)
  }

  if (!waveform) return <>{fallback}</>

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={40}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ width: "100%", height: "36px", cursor: "pointer", display: "block" }}
    />
  )
}
