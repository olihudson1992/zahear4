"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { useEffect, useRef, useMemo, useState } from "react"
import * as THREE from "three"
import type { Album } from "@/lib/albums"

function fibSphere(count: number, radius: number): [number, number, number][] {
  if (count <= 0) return []
  const pts: [number, number, number][] = []
  const offset = 2 / count
  const inc = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = i * inc
    pts.push([Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius])
  }
  return pts
}

function NameChip({
  text, fontClass, ink, base, offset = [1.6, 0, 0],
}: {
  text: string; fontClass: string; ink: string; base: string; offset?: [number, number, number]
}) {
  return (
    <Html center position={offset} distanceFactor={9} pointerEvents="none" zIndexRange={[20, 0]}>
      <span
        className={`${fontClass} whitespace-nowrap rounded-full px-3 py-1 text-lg leading-none`}
        style={{ color: ink, background: `${base}dd`, border: `1px solid ${ink}33`, backdropFilter: "blur(6px)" }}
      >
        {text}
      </span>
    </Html>
  )
}

function PointerLights({ colorA, colorB }: { colorA: string; colorB: string }) {
  const l1 = useRef<THREE.PointLight>(null)
  const l2 = useRef<THREE.PointLight>(null)
  const { viewport, pointer } = useThree()
  const cur = useRef(new THREE.Vector3(0, 0, 6))
  const tgt = useRef(new THREE.Vector3(0, 0, 6))

  useFrame(() => {
    tgt.current.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 6)
    cur.current.lerp(tgt.current, 0.03)
    l1.current?.position.copy(cur.current)
    l2.current?.position.set(-cur.current.x * 0.6, -cur.current.y * 0.6, 4)
  })

  return (
    <>
      <pointLight ref={l1} intensity={140} color={colorA} distance={30} decay={2} />
      <pointLight ref={l2} intensity={100} color={colorB} distance={26} decay={2} />
    </>
  )
}

function AlbumOrb({
  album, basePosition, selected, anySelected, isPlaying, hoverCapable,
  revealed, visited, onReveal, onSelect, onBack,
}: {
  album: Album; basePosition: [number, number, number]
  selected: boolean; anySelected: boolean; isPlaying: boolean
  hoverCapable: boolean; revealed: boolean; visited: boolean
  onReveal: () => void; onSelect: () => void; onBack: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Mesh>(null)
  const coreMat = useRef<THREE.MeshStandardMaterial>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)

  const color = visited && !selected ? "#888888" : album.theme.nodes[0]
  const base = useMemo(() => new THREE.Vector3(...basePosition), [basePosition])
  const seed = useMemo(() => Math.random() * 100, [])
  const showName = !anySelected && (hoverCapable ? hovered : revealed)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const bob = anySelected || revealed ? 0 : Math.sin(t * 0.25 + seed) * 0.12

    g.position.x += ((selected ? 0 : base.x) - g.position.x) * 0.04
    g.position.y += ((selected ? 0 : base.y) + bob - g.position.y) * 0.04
    g.position.z += ((selected ? 0 : base.z) - g.position.z) * 0.04

    const targetScale = selected ? 1.7 : anySelected ? 0.001 : hovered || revealed ? 0.94 : 0.8
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.08)

    const hidden = anySelected && !selected
    if (coreMat.current) {
      coreMat.current.opacity += ((hidden ? 0 : 1) - coreMat.current.opacity) * 0.08
      const pulse = isPlaying && selected ? 1.25 + Math.sin(t * 2.2) * 0.3 : 1.1
      coreMat.current.emissiveIntensity += (pulse - coreMat.current.emissiveIntensity) * 0.06
    }
    if (glowMat.current) {
      const target = hidden ? 0 : selected ? 0.3 : showName ? 0.26 : 0.18
      glowMat.current.opacity += (target - glowMat.current.opacity) * 0.08
    }
    if (core.current) core.current.rotation.y = t * 0.05
  })

  const interactive = !anySelected || selected
  return (
    <group ref={group} position={basePosition}>
      <mesh ref={glow} scale={1.35}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={glowMat} color={color} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh
        ref={core}
        onPointerOver={(e) => { if (!interactive || !hoverCapable) return; e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default" }}
        onClick={(e) => {
          if (!interactive) return; e.stopPropagation()
          if (selected) onBack()
          else if (hoverCapable || revealed) onSelect()
          else onReveal()
        }}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial ref={coreMat} color="#000000" emissive={color} emissiveIntensity={1.1}
          metalness={0} roughness={1} toneMapped={false} transparent opacity={1} />
      </mesh>
      {showName && <NameChip text={album.title} fontClass={album.theme.display} ink={album.theme.ink} base={album.theme.base} />}
    </group>
  )
}

// Gas-cloud track indicator: layered transparent spheres that breathe and pulse.
// No hard geometry — just overlapping soft lights, much easier to tap on mobile.
function TrackOrb({
  name, position, color, ink, base, fontClass,
  active, isPlaying, hoverCapable, revealed, visited, onReveal, onPlay,
}: {
  name: string; position: [number, number, number]
  color: string; ink: string; base: string; fontClass: string
  active: boolean; isPlaying: boolean
  hoverCapable: boolean; revealed: boolean; visited: boolean
  onReveal: () => void; onPlay: () => void
}) {
  const orbColor = visited && !active ? "#888888" : color
  const group    = useRef<THREE.Group>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const midRef   = useRef<THREE.Mesh>(null)
  const coreMat  = useRef<THREE.MeshStandardMaterial>(null)
  const outerMat = useRef<THREE.MeshBasicMaterial>(null)
  const midMat   = useRef<THREE.MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const seed = useMemo(() => Math.random() * 100, [])

  const showName = active || hovered || revealed

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime

    // Scale up when active/hovered so the tap target grows too
    const targetScale = active ? 0.9 : hovered || revealed ? 0.72 : 0.55
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.1)

    // Slow idle breathe; faster beat when playing
    const breathe = active && isPlaying
      ? 1 + Math.sin(t * 3.2 + seed) * 0.18
      : 1 + Math.sin(t * 0.7 + seed) * 0.07

    // Visited-but-inactive orbs stay permanently dim — no hover brightening
    const dim = visited && !active

    // Outer gas cloud — very faint, large
    if (outerRef.current) outerRef.current.scale.setScalar(2.4 * breathe)
    if (outerMat.current) {
      const target = active ? 0.10 : (showName && !dim) ? 0.07 : dim ? 0.025 : 0.04
      outerMat.current.opacity += (target * breathe - outerMat.current.opacity) * 0.06
    }

    // Mid halo
    if (midRef.current) midRef.current.scale.setScalar(1.6 * (0.96 + breathe * 0.04))
    if (midMat.current) {
      const target = active ? 0.22 : (showName && !dim) ? 0.15 : dim ? 0.04 : 0.08
      midMat.current.opacity += (target * breathe - midMat.current.opacity) * 0.07
    }

    // Bright core
    if (coreMat.current) {
      const target = active && isPlaying
        ? 2.0 + Math.sin(t * 3.2 + seed) * 0.5
        : active ? 1.6 : (showName && !dim) ? 1.2 : dim ? 0.25 : 0.7
      coreMat.current.emissiveIntensity += (target - coreMat.current.emissiveIntensity) * 0.08
    }
  })

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    if (!hoverCapable) return; e.stopPropagation()
    setHovered(true); document.body.style.cursor = "pointer"
  }
  const handlePointerOut = () => { setHovered(false); document.body.style.cursor = "default" }
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (hoverCapable || revealed || active) onPlay(); else onReveal()
  }

  return (
    <group ref={group} position={position} scale={0.001}>
      {/* Oversized invisible sphere — big tap target for mobile */}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Outer gas cloud */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial ref={outerMat} color={orbColor} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      {/* Mid halo */}
      <mesh ref={midRef}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial ref={midMat} color={orbColor} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* Bright core */}
      <mesh>
        <sphereGeometry args={[1, 22, 22]} />
        <meshStandardMaterial ref={coreMat} color="#000000" emissive={orbColor}
          emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {showName && <NameChip text={name} fontClass={fontClass} ink={ink} base={base} offset={[1.4, 0, 0]} />}
    </group>
  )
}

function Scene({
  albums, selectedId, onSelectAlbum, currentUrl, onSelectTrack,
  isPlaying, hoverCapable, revealedId, setRevealedId, visitedIds, visitedTrackUrls,
}: {
  albums: Album[]; selectedId: string | null
  onSelectAlbum: (id: string | null) => void; currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void; isPlaying: boolean
  hoverCapable: boolean; revealedId: string | null
  setRevealedId: (id: string | null) => void; visitedIds: Set<string>
  visitedTrackUrls: Set<string>
}) {
  const selected = albums.find((a) => a.id === selectedId) ?? null
  const albumPositions = useMemo(() => fibSphere(albums.length, 4.3), [albums.length])
  const trackPositions = useMemo(
    () => (selected ? fibSphere(selected.tracks.length, 3.2) : []),
    [selected],
  )
  const lightA = selected ? selected.theme.nodes[0] : "#8fb7d6"
  const lightB = selected ? selected.theme.nodes[2] : "#c98fd6"

  return (
    <>
      <ambientLight intensity={0.3} />
      <PointerLights colorA={lightA} colorB={lightB} />

      {albums.map((album, i) => (
        <AlbumOrb
          key={album.id} album={album} basePosition={albumPositions[i]}
          selected={selectedId === album.id} anySelected={selectedId !== null}
          isPlaying={isPlaying} hoverCapable={hoverCapable}
          revealed={revealedId === album.id} visited={visitedIds.has(album.id)}
          onReveal={() => setRevealedId(album.id)}
          onSelect={() => onSelectAlbum(album.id)}
          onBack={() => onSelectAlbum(null)}
        />
      ))}

      {selected && selected.tracks.map((track, i) => (
        <TrackOrb
          key={track.url} name={track.name} position={trackPositions[i]}
          color={selected.theme.nodes[(i % 6) + 1]}
          ink={selected.theme.ink} base={selected.theme.base}
          fontClass={selected.theme.display}
          active={currentUrl === track.url} isPlaying={isPlaying}
          hoverCapable={hoverCapable} revealed={revealedId === track.url}
          visited={visitedTrackUrls.has(track.url)}
          onReveal={() => setRevealedId(track.url)}
          onPlay={() => onSelectTrack(selected, i)}
        />
      ))}

      <OrbitControls enableDamping dampingFactor={0.05} enablePan={false}
        enableZoom rotateSpeed={0.5} zoomSpeed={0.6}
        minDistance={6} maxDistance={18} target={[0, 0, 0]} />
    </>
  )
}

export function OrbScene(props: {
  albums: Album[]; selectedId: string | null
  onSelectAlbum: (id: string | null) => void; currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void; isPlaying: boolean
  visitedIds: Set<string>; visitedTrackUrls: Set<string>
}) {
  const [hoverCapable, setHoverCapable] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setHoverCapable(mq.matches)
    const on = () => setHoverCapable(mq.matches)
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])

  const [revealedId, setRevealedId] = useState<string | null>(null)
  useEffect(() => setRevealedId(null), [props.selectedId])

  const handleMissed = () => {
    if (revealedId) setRevealedId(null)
    else if (props.selectedId === null) props.onSelectAlbum(null)
  }

  return (
    <Canvas className="absolute inset-0"
      camera={{ position: [0, 0, 13], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]} onPointerMissed={handleMissed}
    >
      <Scene {...props} hoverCapable={hoverCapable}
        revealedId={revealedId} setRevealedId={setRevealedId}
        visitedIds={props.visitedIds} visitedTrackUrls={props.visitedTrackUrls} />
    </Canvas>
  )
}
