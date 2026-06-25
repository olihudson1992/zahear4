"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { useEffect, useRef, useMemo, useState } from "react"
import * as THREE from "three"
import type { Album } from "@/lib/albums"

const TRACK_SHAPES = [
  "icosahedron",
  "torus",
  "octahedron",
  "torusKnot",
  "tetrahedron",
  "dodecahedron",
  "box",
] as const
type TrackShape = (typeof TRACK_SHAPES)[number]

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
  text,
  fontClass,
  ink,
  base,
  offset = [1.6, 0, 0],
}: {
  text: string
  fontClass: string
  ink: string
  base: string
  offset?: [number, number, number]
}) {
  return (
    <Html center position={offset} distanceFactor={9} pointerEvents="none" zIndexRange={[20, 0]}>
      <span
        className={`${fontClass} whitespace-nowrap rounded-full px-3 py-1 text-lg leading-none`}
        style={{
          color: ink,
          background: `${base}dd`,
          border: `1px solid ${ink}33`,
          backdropFilter: "blur(6px)",
        }}
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
  album,
  basePosition,
  selected,
  anySelected,
  isPlaying,
  hoverCapable,
  revealed,
  visited,
  onReveal,
  onSelect,
  onBack,
}: {
  album: Album
  basePosition: [number, number, number]
  selected: boolean
  anySelected: boolean
  isPlaying: boolean
  hoverCapable: boolean
  revealed: boolean
  visited: boolean
  onReveal: () => void
  onSelect: () => void
  onBack: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Mesh>(null)
  const coreMat = useRef<THREE.MeshStandardMaterial>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Visited orbs turn grey so users can track what they've opened
  const color = visited && !selected ? "#888888" : album.theme.nodes[0]
  const base = useMemo(() => new THREE.Vector3(...basePosition), [basePosition])
  const seed = useMemo(() => Math.random() * 100, [])

  const showName = !anySelected && (hoverCapable ? hovered : revealed)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime

    const tx = selected ? 0 : base.x
    const ty = selected ? 0 : base.y
    const tz = selected ? 0 : base.z
    const bob = anySelected || revealed ? 0 : Math.sin(t * 0.25 + seed) * 0.12
    g.position.x += (tx - g.position.x) * 0.04
    g.position.y += (ty + bob - g.position.y) * 0.04
    g.position.z += (tz - g.position.z) * 0.04

    const targetScale = selected ? 1.7 : anySelected ? 0.001 : hovered || revealed ? 0.94 : 0.8
    const s = g.scale.x + (targetScale - g.scale.x) * 0.08
    g.scale.setScalar(s)

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
        onPointerOver={(e) => {
          if (!interactive || !hoverCapable) return
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        onClick={(e) => {
          if (!interactive) return
          e.stopPropagation()
          if (selected) onBack()
          else if (hoverCapable || revealed) onSelect()
          else onReveal()
        }}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#000000"
          emissive={color}
          emissiveIntensity={1.1}
          metalness={0}
          roughness={1}
          toneMapped={false}
          transparent
          opacity={1}
        />
      </mesh>
      {showName && (
        <NameChip
          text={album.title}
          fontClass={album.theme.display}
          ink={album.theme.ink}
          base={album.theme.base}
        />
      )}
    </group>
  )
}

function ShapeGeometry({ shape }: { shape: TrackShape }) {
  switch (shape) {
    case "torus":        return <torusGeometry args={[0.65, 0.3, 20, 40]} />
    case "icosahedron":  return <icosahedronGeometry args={[1, 0]} />
    case "octahedron":   return <octahedronGeometry args={[1, 0]} />
    case "tetrahedron":  return <tetrahedronGeometry args={[1.1, 0]} />
    case "torusKnot":    return <torusKnotGeometry args={[0.6, 0.22, 80, 10]} />
    case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />
    case "box":          return <boxGeometry args={[1.3, 1.3, 1.3]} />
  }
}

function TrackOrb({
  name,
  position,
  color,
  ink,
  base,
  fontClass,
  active,
  isPlaying,
  hoverCapable,
  revealed,
  shape,
  onReveal,
  onPlay,
}: {
  name: string
  position: [number, number, number]
  color: string
  ink: string
  base: string
  fontClass: string
  active: boolean
  isPlaying: boolean
  hoverCapable: boolean
  revealed: boolean
  shape: TrackShape
  onReveal: () => void
  onPlay: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const visualMesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const seed = useMemo(() => Math.random() * 100, [])

  // Name shows on hover (mouse) or after first tap (touch)
  const showName = active || hovered || revealed

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const target = active ? 0.85 : hovered || revealed ? 0.7 : 0.5
    const s = g.scale.x + (target - g.scale.x) * 0.1
    g.scale.setScalar(s)

    if (mat.current) {
      const pulse = active && isPlaying
        ? 1.5 + Math.sin(t * 3 + seed) * 0.35
        : active ? 1.3
        : showName ? 1.15
        : 0.9
      mat.current.emissiveIntensity += (pulse - mat.current.emissiveIntensity) * 0.08
    }

    // Each shape tumbles on all three axes at slightly different speeds
    if (visualMesh.current) {
      visualMesh.current.rotation.y = t * (0.10 + (seed % 0.08))
      visualMesh.current.rotation.x = t * (0.06 + (seed % 0.05))
      visualMesh.current.rotation.z = t * (0.04 + (seed % 0.03))
    }
  })

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    if (!hoverCapable) return
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = "default"
  }
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    // Mouse: always play immediately (hover already shows name)
    // Touch: first tap reveals name, second tap plays
    if (hoverCapable || revealed || active) onPlay()
    else onReveal()
  }

  return (
    <group ref={group} position={position} scale={0.001}>
      {/* Invisible sphere collider — reliable hit area regardless of visual shape.
          Slightly oversized (r=1.35) so edge-clicks still register. */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1.35, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Visual shape — purely decorative, no pointer events */}
      <mesh ref={visualMesh}>
        <ShapeGeometry shape={shape} />
        <meshStandardMaterial
          ref={mat}
          color="#000000"
          emissive={color}
          emissiveIntensity={0.9}
          metalness={0.1}
          roughness={0.7}
          toneMapped={false}
        />
      </mesh>

      {showName && (
        <NameChip text={name} fontClass={fontClass} ink={ink} base={base} offset={[1.4, 0, 0]} />
      )}
    </group>
  )
}

function Scene({
  albums,
  selectedId,
  onSelectAlbum,
  currentUrl,
  onSelectTrack,
  isPlaying,
  hoverCapable,
  revealedId,
  setRevealedId,
  visitedIds,
}: {
  albums: Album[]
  selectedId: string | null
  onSelectAlbum: (id: string | null) => void
  currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void
  isPlaying: boolean
  hoverCapable: boolean
  revealedId: string | null
  setRevealedId: (id: string | null) => void
  visitedIds: Set<string>
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
          key={album.id}
          album={album}
          basePosition={albumPositions[i]}
          selected={selectedId === album.id}
          anySelected={selectedId !== null}
          isPlaying={isPlaying}
          hoverCapable={hoverCapable}
          revealed={revealedId === album.id}
          visited={visitedIds.has(album.id)}
          onReveal={() => setRevealedId(album.id)}
          onSelect={() => onSelectAlbum(album.id)}
          onBack={() => onSelectAlbum(null)}
        />
      ))}

      {selected &&
        selected.tracks.map((track, i) => (
          <TrackOrb
            key={track.url}
            name={track.name}
            position={trackPositions[i]}
            color={selected.theme.nodes[(i % 6) + 1]}
            ink={selected.theme.ink}
            base={selected.theme.base}
            fontClass={selected.theme.display}
            active={currentUrl === track.url}
            isPlaying={isPlaying}
            hoverCapable={hoverCapable}
            revealed={revealedId === track.url}
            shape={TRACK_SHAPES[i % TRACK_SHAPES.length]}
            onReveal={() => setRevealedId(track.url)}
            onPlay={() => onSelectTrack(selected, i)}
          />
        ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        enableZoom
        autoRotate={false}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
        minDistance={6}
        maxDistance={18}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function OrbScene(props: {
  albums: Album[]
  selectedId: string | null
  onSelectAlbum: (id: string | null) => void
  currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void
  isPlaying: boolean
  visitedIds: Set<string>
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
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 13], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      onPointerMissed={handleMissed}
    >
      <Scene
        {...props}
        hoverCapable={hoverCapable}
        revealedId={revealedId}
        setRevealedId={setRevealedId}
        visitedIds={props.visitedIds}
      />
    </Canvas>
  )
}
