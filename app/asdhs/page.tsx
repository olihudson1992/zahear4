"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { GradientPlane } from "./gradient-plane"
import { GradientDisk } from "./gradient-disk"
import { GradientTriangle } from "./gradient-triangle"
import { MirrorRing } from "./mirror-ring"
import { OneWayMirror } from "./one-way-mirror"
import { FloatingAudioControls } from "./floating-audio-controls"
import { useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export type ColorPoint = {
  color: [number, number, number]
  position: [number, number]
  opacity: number
}

function FloatingTrackName({ trackName, trackColor, trackFont, onDownload }: { trackName: string; trackColor: string; trackFont: string; onDownload: () => void }) {
  const ref = useRef<THREE.Group>(null)
  const offsetRef = useRef({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 })
  const speedRef = useRef(0.1 + Math.random() * 0.1)

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.elapsedTime * speedRef.current
    ref.current.position.x = Math.sin(time * 0.5 + offsetRef.current.x) * 2
    ref.current.position.y = Math.cos(time * 0.3 + offsetRef.current.y) * 1.5 - 4
  })

  return (
    <group ref={ref} position={[0, -4, 3]}>
      <Html center>
        <button onClick={onDownload} className={`${trackFont} text-xs font-semibold hover:underline cursor-pointer transition-all hover:scale-105 whitespace-nowrap`} style={{ color: trackColor }}>
          {trackName}
        </button>
      </Html>
    </group>
  )
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

export default function Page() {
  const generateRandomColorPoints = (): ColorPoint[] => {
    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2
      let r = 0, g = 0, b = 0
      if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c } else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c } else if (h < 300) { r = x; b = c } else { r = c; b = x }
      return [r + m, g + m, b + m]
    }
    return Array.from({ length: 5 }, () => {
      const [r, g, b] = hslToRgb(Math.random() * 360, 0.7 + Math.random() * 0.3, 0.4 + Math.random() * 0.3)
      return { color: [r, g, b] as [number, number, number], position: [Math.random(), Math.random()] as [number, number], opacity: 0.6 + Math.random() * 0.4 }
    })
  }

  const [colorPoints, setColorPoints] = useState<ColorPoint[]>(generateRandomColorPoints())
  const [audioData, setAudioData] = useState<Float32Array | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [trackFont, setTrackFont] = useState("font-sans")
  const [trackColor, setTrackColor] = useState("#00ffff")
  const [trackName, setTrackName] = useState("")

  const getFileName = (url: string) => decodeURIComponent(url.split("/").pop() || "")
  const handleDownload = () => { const l = document.createElement("a"); l.href = TRACKS[currentTrack]; l.download = getFileName(TRACKS[currentTrack]); l.click() }

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
        <pointLight position={[-10, -10, 5]} intensity={2.5} color="#4488ff" />
        <pointLight position={[0, 0, 5]} intensity={3} color="#ffaa00" />
        <pointLight position={[5, 5, 8]} intensity={2} color="#ff44aa" />
        <pointLight position={[-5, -5, 8]} intensity={2} color="#44ffaa" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow />
        <spotLight position={[0, -10, 5]} angle={0.4} penumbra={1} intensity={2} color="#8844ff" />

        <GradientPlane colorPoints={colorPoints} setColorPoints={setColorPoints} audioData={audioData} isPlaying={isPlaying} />
        <GradientDisk audioData={audioData} isPlaying={isPlaying} />
        <GradientTriangle audioData={audioData} isPlaying={isPlaying} />
        <MirrorRing />
        <OneWayMirror />

        <FloatingTrackName trackName={trackName} trackColor={trackColor} trackFont={trackFont} onDownload={handleDownload} />

        <FloatingAudioControls
          setAudioData={setAudioData}
          setIsPlaying={setIsPlaying}
          setCurrentTrack={(i) => { setCurrentTrack(i); setTrackFont(FONTS[Math.floor(Math.random() * FONTS.length)]); setTrackColor(TRACK_COLORS[Math.floor(Math.random() * TRACK_COLORS.length)]); setTrackName(getFileName(TRACKS[i])) }}
          setColorPoints={setColorPoints}
          generateRandomColorPoints={generateRandomColorPoints}
        />

        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
