"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Html } from "@react-three/drei"
import { Play, Pause, Volume2, SkipForward, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { ColorPoint } from "./page"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

type FloatingAudioControlsProps = {
  setAudioData: (data: Float32Array | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTrack: (track: number) => void
  setColorPoints: (points: ColorPoint[]) => void
  generateRandomColorPoints: () => ColorPoint[]
}

const TRACKS = [
  "https://rangatracks.b-cdn.net/Adushs.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/-%20%20-%20.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/BRANDY%20PT1.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/BRANDY%20PT2.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/hygytvubnjmk.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/ip%20op_ranga.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Jungle%20Dreams.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/pank2_ranga.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Beat%201.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Beat%202.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Beat%203.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Beat%204.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Beat%205%266.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Drifty.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Glass%20Tiger.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Last%20Beat%202.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Last%20Beat.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Beats%20-%20Ranga%20Live.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/brandy%20RANGA%2023.mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/hoppyfun_%20(1).mp3",
  "https://rangatracks.b-cdn.net/demos/AZAR/Ranga%20-%20Picse.mp3",
]

const FONTS = ["font-mono", "font-sans", "font-serif"]
const TRACK_COLORS = ["#00ffff","#ff00ff","#ffff00","#00ff00","#ff6600","#ff0066","#66ff00","#0066ff","#ff00aa","#00ffaa","#aa00ff","#ffaa00"]

export function FloatingAudioControls({ setAudioData, setIsPlaying, setCurrentTrack, setColorPoints, generateRandomColorPoints }: FloatingAudioControlsProps) {
  const [isPlayingLocal, setIsPlayingLocal] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [position, setPosition] = useState<[number, number, number]>([0, -3.5, 2])
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const { camera, size } = useThree()
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragStartPosRef = useRef(new THREE.Vector3())
  const originalPosRef = useRef(new THREE.Vector3())

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const shouldAutoPlayRef = useRef(false)
  const audioContextInitializedRef = useRef(false)

  const getFileName = (url: string) => decodeURIComponent(url.split("/").pop() || "")

  const switchToRandomTrack = () => {
    let newIndex
    do { newIndex = Math.floor(Math.random() * TRACKS.length) } while (newIndex === currentTrackIndex && TRACKS.length > 1)
    setCurrentTrackIndex(newIndex)
    setCurrentTrack(newIndex)
    setColorPoints(generateRandomColorPoints())
    if (audioRef.current) {
      shouldAutoPlayRef.current = isPlayingLocal
      audioRef.current.pause()
      audioRef.current.src = TRACKS[newIndex]
      audioRef.current.load()
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    const mouse = new THREE.Vector2((e.clientX / size.width) * 2 - 1, -(e.clientY / size.height) * 2 + 1)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const pt = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlaneRef.current, pt)
    dragStartPosRef.current.copy(pt)
    originalPosRef.current.set(...position)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return
    const mouse = new THREE.Vector2((e.clientX / size.width) * 2 - 1, -(e.clientY / size.height) * 2 + 1)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const pt = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlaneRef.current, pt)
    const delta = pt.clone().sub(dragStartPosRef.current)
    const np = originalPosRef.current.clone().add(delta)
    setPosition([np.x, np.y, np.z])
  }

  const handlePointerUp = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      return () => { window.removeEventListener("pointermove", handlePointerMove); window.removeEventListener("pointerup", handlePointerUp) }
    }
  }, [isDragging])

  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close()
    audioContextRef.current = null; analyserRef.current = null; sourceRef.current = null; audioContextInitializedRef.current = false

    const audio = new Audio(TRACKS[currentTrackIndex])
    audio.crossOrigin = "anonymous"; audio.volume = volume; audio.loop = false

    const handleCanPlayThrough = () => {
      if (shouldAutoPlayRef.current && audioRef.current) {
        initAudioContext()
        audioRef.current.play().catch(console.error)
        shouldAutoPlayRef.current = false
      }
    }

    audio.addEventListener("ended", switchToRandomTrack)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audioRef.current = audio

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      audio.removeEventListener("ended", switchToRandomTrack)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.pause()
      audioRef.current = null
      if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close()
    }
  }, [currentTrackIndex])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  const initAudioContext = () => {
    if (!audioRef.current || audioContextInitializedRef.current) return
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaElementSource(audioRef.current)
    source.connect(analyser); analyser.connect(ctx.destination)
    audioContextRef.current = ctx; analyserRef.current = analyser; sourceRef.current = source; audioContextInitializedRef.current = true
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    dataArrayRef.current = dataArray
    const update = () => {
      if (!analyserRef.current || !dataArrayRef.current) return
      analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>)
      setAudioData(new Float32Array(dataArrayRef.current))
      animationFrameRef.current = requestAnimationFrame(update)
    }
    update()
  }

  const togglePlayPause = async () => {
    if (!audioRef.current) return
    if (isPlayingLocal) {
      audioRef.current.pause(); setIsPlayingLocal(false); setIsPlaying(false)
    } else {
      if (!audioContextInitializedRef.current) initAudioContext()
      if (audioContextRef.current?.state === "suspended") await audioContextRef.current.resume()
      try { await audioRef.current.play(); setIsPlayingLocal(true); setIsPlaying(true) } catch (e) { console.error(e) }
    }
  }

  return (
    <group position={position}>
      <Html center>
        <div className="relative">
          <div className="absolute inset-0 transition-all duration-700 ease-in-out" style={{ transform: isMinimized ? "scale(0.15)" : "scale(1)", opacity: isMinimized ? 0 : 1, pointerEvents: isMinimized ? "none" : "auto" }}>
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl cursor-move select-none" style={{ width: "400px" }} onPointerDown={handlePointerDown}>
              <div className="flex items-center gap-4">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsMinimized(true) }} className="h-8 w-8 rounded-full bg-white/90 hover:bg-white p-0 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                  <Minus className="w-4 h-4 text-black" />
                </Button>
                <Button size="lg" variant={isPlayingLocal ? "default" : "outline"} onClick={togglePlayPause} onPointerDown={(e) => e.stopPropagation()} className="h-12 w-12 rounded-full shrink-0">
                  {isPlayingLocal ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <Volume2 className="w-5 h-5 text-white shrink-0" />
                  <div onPointerDown={(e) => e.stopPropagation()} className="flex-1">
                    <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={1} step={0.01} className="flex-1" />
                  </div>
                </div>
                <div className="text-sm text-white/70 font-mono min-w-[60px] text-center shrink-0">{currentTrackIndex + 1}/{TRACKS.length}</div>
                <Button size="lg" variant="outline" onClick={switchToRandomTrack} onPointerDown={(e) => e.stopPropagation()} className="h-12 w-12 rounded-full bg-transparent shrink-0">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out" style={{ transform: isMinimized ? "scale(1)" : "scale(0.15)", opacity: isMinimized ? 1 : 0, pointerEvents: isMinimized ? "auto" : "none" }}>
            <button className="w-16 h-16 rounded-full bg-black border-2 border-white/40 hover:border-white/80 cursor-move shadow-2xl transition-all hover:scale-110 select-none" onPointerDown={handlePointerDown} onClick={(e) => { e.stopPropagation(); setIsMinimized(false) }} />
          </div>
        </div>
      </Html>
    </group>
  )
}
