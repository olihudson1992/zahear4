"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { albums, type Album, type Track } from "@/lib/albums"

function shuffleExcluding(n: number, exclude: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i).filter((i) => i !== exclude)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export type PlayerState = {
  album: Album | null
  track: Track | null
  trackIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  energy: number
  error: string | null
  loading: boolean
}

export function usePlayer(albumsSource: Album[] = albums, ordered = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const trackGainRef = useRef(2.2)  // per-track boost; updated in playTrack
  const shuffleQueueRef = useRef<number[]>([])
  const playHistoryRef  = useRef<number[]>([])

  const [albumId, setAlbumId] = useState<string | null>(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [energy, setEnergy] = useState(0)

  const album = albumsSource.find((a) => a.id === albumId) ?? null
  const track = album?.tracks[trackIndex] ?? null

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    // Required for Web Audio to process cross-origin streams (BunnyCDN with CORS enabled)
    audio.crossOrigin = "anonymous"

    // Web Audio chain: gain boost (~+7 dB) → brickwall limiter → output
    // Falls back silently if AudioContext is unavailable (SSR, policy, etc.)
    try {
      const Ctx = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) {
        const ctx = new Ctx()
        const src = ctx.createMediaElementSource(audio)
        const gain = ctx.createGain()
        gain.gain.value = 1.0
        const lim = ctx.createDynamicsCompressor()
        lim.threshold.value = -0.2     // dBFS — brickwall ceiling only
        lim.knee.value = 1
        lim.ratio.value = 20           // 20:1 = brickwall
        lim.attack.value = 0.001       // 1 ms
        lim.release.value = 0.06       // 60 ms
        src.connect(gain)
        gain.connect(lim)
        lim.connect(ctx.destination)
        gainNodeRef.current = gain
        audioCtxRef.current = ctx
      }
    } catch {
      // Web Audio unavailable — plain audio still works fine
    }

    audioRef.current = audio

    const onTime    = () => setCurrentTime(audio.currentTime)
    const onMeta    = () => setDuration(audio.duration || 0)
    const onEnd     = () => setIsPlaying(false)
    const onPlay    = () => {
      setIsPlaying(true)
      // AudioContext must be resumed after a user gesture
      if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume()
    }
    const onPause   = () => setIsPlaying(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onError   = () => { setLoading(false); setError("Couldn't load this track.") }

    audio.addEventListener("timeupdate",     onTime)
    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("ended",          onEnd)
    audio.addEventListener("play",           onPlay)
    audio.addEventListener("pause",          onPause)
    audio.addEventListener("waiting",        onWaiting)
    audio.addEventListener("playing",        onPlaying)
    audio.addEventListener("error",          onError)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate",     onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("ended",          onEnd)
      audio.removeEventListener("play",           onPlay)
      audio.removeEventListener("pause",          onPause)
      audio.removeEventListener("waiting",        onWaiting)
      audio.removeEventListener("playing",        onPlaying)
      audio.removeEventListener("error",          onError)
    }
  }, [])

  // Energy envelope — eases toward 1 while playing, 0.12 while paused
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = isPlaying ? 1 : 0.12
      setEnergy((e) => e + (target - e) * Math.min(1, dt * 2.2))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying])

  const playTrack = useCallback(
    (nextAlbumId: string, index: number, rebuildShuffle = true) => {
      const a = albumsSource.find((al) => al.id === nextAlbumId)
      const t = a?.tracks[index]
      const audio = audioRef.current
      if (!a || !t || !audio) return

      setError(null)
      setLoading(true)
      setAlbumId(nextAlbumId)
      setTrackIndex(index)
      setCurrentTime(0)
      setDuration(0)

      if (rebuildShuffle && a.tracks.length > 1) shuffleQueueRef.current = shuffleExcluding(a.tracks.length, index)

      audio.src = t.url
      if (t.startTime) {
        const skip = () => { audio.currentTime = t.startTime!; audio.removeEventListener("loadedmetadata", skip) }
        audio.addEventListener("loadedmetadata", skip)
      }
      trackGainRef.current = t.gain ?? 1.0
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volume * trackGainRef.current
      } else {
        audio.volume = volume
      }

      const doPlay = () => {
        const p = audio.play()
        if (p) p.catch(() => { setLoading(false); setIsPlaying(false) })
      }
      const ctx = audioCtxRef.current
      if (ctx && ctx.state !== "running") {
        ctx.resume().then(doPlay).catch(doPlay)
      } else {
        doPlay()
      }
    },
    [volume],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    if (audio.paused) {
      const doPlay = () => {
        const p = audio.play()
        if (p) p.catch(() => setIsPlaying(false))
      }
      const ctx = audioCtxRef.current
      if (ctx && ctx.state !== "running") {
        ctx.resume().then(doPlay).catch(doPlay)
      } else {
        doPlay()
      }
    } else {
      audio.pause()
    }
  }, [track])

  const next = useCallback(() => {
    if (!album) return
    playHistoryRef.current.push(trackIndex)
    if (playHistoryRef.current.length > 30) playHistoryRef.current.shift()
    const forced = album.tracks[trackIndex]?.nextUrl
    if (forced) {
      const forcedIdx = album.tracks.findIndex(t => t.url === forced)
      if (forcedIdx >= 0) {
        shuffleQueueRef.current = shuffleQueueRef.current.filter(i => i !== forcedIdx)
        playTrack(album.id, forcedIdx, false)
        return
      }
    }
    if (ordered) {
      playTrack(album.id, (trackIndex + 1) % album.tracks.length, false)
      return
    }
    if (shuffleQueueRef.current.length === 0) {
      shuffleQueueRef.current = shuffleExcluding(album.tracks.length, trackIndex)
    }
    const nextIdx = shuffleQueueRef.current.shift()
    if (nextIdx !== undefined) playTrack(album.id, nextIdx, false)
  }, [album, trackIndex, playTrack, ordered])

  const prev = useCallback(() => {
    if (!album) return
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return }
    if (playHistoryRef.current.length > 0) {
      const prevIdx = playHistoryRef.current.pop()!
      shuffleQueueRef.current.unshift(trackIndex)
      playTrack(album.id, prevIdx, false)
    } else if (audio) {
      audio.currentTime = 0
    }
  }, [album, trackIndex, playTrack])

  const seek = useCallback((t: number) => {
    const audio = audioRef.current
    if (audio && isFinite(t)) { audio.currentTime = t; setCurrentTime(t) }
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = v * trackGainRef.current
    } else if (audioRef.current) {
      audioRef.current.volume = v
    }
  }, [])

  // Auto-advance on track end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (!album) return
      playHistoryRef.current.push(trackIndex)
      if (playHistoryRef.current.length > 30) playHistoryRef.current.shift()
      const forced = album.tracks[trackIndex]?.nextUrl
      if (forced) {
        const forcedIdx = album.tracks.findIndex(t => t.url === forced)
        if (forcedIdx >= 0) {
          shuffleQueueRef.current = shuffleQueueRef.current.filter(i => i !== forcedIdx)
          playTrack(album.id, forcedIdx, false)
          return
        }
      }
      if (ordered) {
        playTrack(album.id, (trackIndex + 1) % album.tracks.length, false)
        return
      }
      if (shuffleQueueRef.current.length === 0) {
        shuffleQueueRef.current = shuffleExcluding(album.tracks.length, trackIndex)
      }
      const nextIdx = shuffleQueueRef.current.shift()
      if (nextIdx !== undefined) playTrack(album.id, nextIdx, false)
    }
    audio.addEventListener("ended", onEnded)
    return () => audio.removeEventListener("ended", onEnded)
  }, [album, trackIndex, playTrack, ordered])

  const state: PlayerState = {
    album, track, trackIndex, isPlaying,
    currentTime, duration, volume, energy, error, loading,
  }

  return { state, playTrack, toggle, next, prev, seek, setVolume }
}
