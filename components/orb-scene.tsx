"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { createContext, useContext, useEffect, useRef, useMemo, useState } from "react"
import * as THREE from "three"
import type { Album } from "@/lib/albums"

function fibSphere(count: number, radius: number, stretchY = 1): [number, number, number][] {
  if (count <= 0) return []
  const pts: [number, number, number][] = []
  const offset = 2 / count
  const inc = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = i * inc
    pts.push([Math.cos(phi) * r * radius, y * radius * stretchY, Math.sin(phi) * r * radius])
  }
  return pts
}

// ------- Physics context — lets TrackOrbs read their world-space position from the
// parent physics system without triggering React re-renders each frame.
type PhysicsCtx = { positions: React.MutableRefObject<THREE.Vector3[]> }
const TrackPhysicsCtx = createContext<PhysicsCtx | null>(null)

function NameChip({
  text, fontClass, ink, base, offset = [1.6, 0, 0],
}: {
  text: string; fontClass: string; ink: string; base: string; offset?: [number, number, number]
}) {
  const spanRef = useRef<HTMLSpanElement>(null)
  useFrame(({ camera }) => {
    if (!spanRef.current) return
    const dist = camera.position.length()
    // Grow gently as user zooms out (dist 6→24), baseline at dist≈9
    const sz = Math.round(Math.max(12, Math.min(22, 14 + (dist - 9) * 0.5)))
    spanRef.current.style.fontSize = `${sz}px`
  })
  return (
    <Html center position={offset} pointerEvents="none" zIndexRange={[20, 0]}>
      <span
        ref={spanRef}
        className={`${fontClass} whitespace-nowrap rounded-full px-3 py-1 leading-none`}
        style={{ fontSize: 14, color: ink, background: `${base}dd`, border: `1px solid ${ink}33`, backdropFilter: "blur(6px)", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }}
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
  revealed, visited, onReveal, onSelect, onBack, scifi,
}: {
  album: Album; basePosition: [number, number, number]
  selected: boolean; anySelected: boolean; isPlaying: boolean
  hoverCapable: boolean; revealed: boolean; visited: boolean
  onReveal: () => void; onSelect: () => void; onBack: () => void
  scifi?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const collider = useRef<THREE.Mesh>(null)
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
    const tetra = album.shape === "tetrahedron"
    const bobX = (anySelected || tetra) ? 0 : Math.sin(t * 0.17 + seed * 1.3) * 0.18
    const bobY = (anySelected || revealed || tetra) ? 0 : Math.sin(t * 0.27 + seed) * 0.24
    const bobZ = (anySelected || tetra) ? 0 : Math.cos(t * 0.21 + seed * 0.8) * 0.14

    g.position.x += ((selected ? 0 : base.x + bobX) - g.position.x) * 0.04
    g.position.y += ((selected ? 0 : base.y + bobY) - g.position.y) * 0.04
    g.position.z += ((selected ? 0 : base.z + bobZ) - g.position.z) * 0.04

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
    if (core.current) {
      if (album.shape === "tetrahedron") {
        core.current.rotation.x = t * 0.13
        core.current.rotation.y = t * 0.21
        core.current.rotation.z = t * 0.08
      } else {
        core.current.rotation.y = t * 0.05
      }
    }
    // Shrink hit collider when selected so track orbs are easy to tap
    if (collider.current) {
      const targetColliderScale = selected ? 0.45 : 1
      collider.current.scale.setScalar(collider.current.scale.x + (targetColliderScale - collider.current.scale.x) * 0.1)
    }
  })

  const interactive = !anySelected || selected
  return (
    <group ref={group} position={basePosition}>
      {/* Sci-fi outer silver rim */}
      {scifi && (
        <mesh scale={1.75}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshBasicMaterial color="#c8e4ff" transparent opacity={0.06} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh scale={1.35}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={glowMat} color={color} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Invisible collider — oversized when unselected for easy tapping, tight when selected so track orbs are reachable */}
      <mesh
        ref={collider}
        onPointerOver={(e) => { if (!interactive || !hoverCapable) return; e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default" }}
        onClick={(e) => {
          if (!interactive) return; e.stopPropagation()
          if (selected) onBack()
          else if (hoverCapable || revealed) onSelect()
          else onReveal()
        }}
      >
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Visual core — display only */}
      <mesh ref={core}>
        {album.shape === "tetrahedron"
          ? <tetrahedronGeometry args={[1.2, 0]} />
          : <sphereGeometry args={[1, 48, 48]} />
        }
        <meshStandardMaterial ref={coreMat}
          color={scifi ? "#05050f" : "#000000"}
          emissive={color} emissiveIntensity={1.1}
          metalness={scifi ? 0.9 : 0} roughness={scifi ? 0.05 : 1}
          toneMapped={false} transparent opacity={1} />
      </mesh>
      {showName && <NameChip text={album.title} fontClass={album.theme.display} ink={album.theme.ink} base={album.theme.base} />}
    </group>
  )
}

// ------- TrackOrb -------
// Position is driven by the physics context (lerped in useFrame) rather than a static prop.
function TrackOrb({
  physicsIndex, name, color, ink, base, fontClass,
  active, isPlaying, hoverCapable, revealed, visited, onReveal, onPlay, scifi,
}: {
  physicsIndex: number
  name: string; color: string; ink: string; base: string; fontClass: string
  active: boolean; isPlaying: boolean
  hoverCapable: boolean; revealed: boolean; visited: boolean
  onReveal: () => void; onPlay: () => void
  scifi?: boolean
}) {
  const orbColor = visited && !active ? "#888888" : color
  const physics  = useContext(TrackPhysicsCtx)
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

    // Smoothly follow physics position
    const phys = physics?.positions.current[physicsIndex]
    if (phys) g.position.lerp(phys, 0.06)

    // Scale up when active/hovered so the tap target grows too
    const targetScale = active ? 0.9 : hovered || revealed ? 0.72 : 0.55
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.1)

    const breathe = active && isPlaying
      ? 1 + Math.sin(t * 3.2 + seed) * 0.18
      : 1 + Math.sin(t * 0.7 + seed) * 0.07

    const dim = visited && !active

    if (outerRef.current) outerRef.current.scale.setScalar(2.4 * breathe)
    if (outerMat.current) {
      const target = active ? 0.10 : (showName && !dim) ? 0.07 : dim ? 0.025 : 0.04
      outerMat.current.opacity += (target * breathe - outerMat.current.opacity) * 0.06
    }

    if (midRef.current) midRef.current.scale.setScalar(1.6 * (0.96 + breathe * 0.04))
    if (midMat.current) {
      const target = active ? 0.22 : (showName && !dim) ? 0.15 : dim ? 0.04 : 0.08
      midMat.current.opacity += (target * breathe - midMat.current.opacity) * 0.07
    }

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
    <group ref={group} scale={0.001}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial ref={outerMat} color={orbColor} transparent opacity={0.04} depthWrite={false} />
      </mesh>

      <mesh ref={midRef}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshBasicMaterial ref={midMat} color={orbColor} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {scifi && (
        <mesh scale={2.8}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color="#b8d8ff" transparent opacity={0.05} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[1, 22, 22]} />
        <meshStandardMaterial ref={coreMat}
          color={scifi ? "#05050f" : "#000000"}
          emissive={orbColor} emissiveIntensity={0.7}
          metalness={scifi ? 0.85 : 0} roughness={scifi ? 0.08 : 1}
          toneMapped={false} />
      </mesh>

      {showName && <NameChip text={name} fontClass={fontClass} ink={ink} base={base} offset={[1.4, 0, 0]} />}
    </group>
  )
}

// ------- TrackOrbsPhysics -------
// Runs an n-body simulation for all track orbs: each orb orbits the origin and
// repels its neighbours. Positions are stored in a ref (no React state updates per frame)
// and read by TrackOrb via context.
function TrackOrbsPhysics({
  selected, currentUrl, isPlaying, hoverCapable,
  revealedId, setRevealedId, onSelectTrack, visitedTrackUrls, scifi,
}: {
  selected: Album
  currentUrl: string | null
  isPlaying: boolean
  hoverCapable: boolean
  revealedId: string | null
  setRevealedId: (id: string | null) => void
  onSelectTrack: (album: Album, index: number) => void
  visitedTrackUrls: Set<string>
  scifi?: boolean
}) {
  const TARGET_R  = 3.1   // desired orbital radius
  const K_SPRING  = 2.2   // spring strength pulling each orb back toward TARGET_R
  const K_REPEL   = 6.0   // repulsion force magnitude
  const MIN_SEP   = 1.9   // repulsion activates below this inter-orb distance
  const DAMP      = 0.025 // exponential damping coefficient (low = long-lived orbits)
  const NOISE     = 0.12  // random nudge per second to keep things lively

  const posRef    = useRef<THREE.Vector3[]>([])
  const velRef    = useRef<THREE.Vector3[]>([])
  const prevId    = useRef("")

  // (Re)initialise whenever a new album is opened
  useEffect(() => {
    if (selected.id === prevId.current) return
    prevId.current = selected.id
    const spread = fibSphere(selected.tracks.length, TARGET_R)
    posRef.current = spread.map((p) => new THREE.Vector3(...p))
    velRef.current = posRef.current.map((pos) => {
      // Give each orb an initial tangential velocity so it immediately starts orbiting.
      // A random tilt axis means each orb orbits on its own slightly different plane.
      const axis = new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        1,
        (Math.random() - 0.5) * 0.6,
      ).normalize()
      return new THREE.Vector3()
        .crossVectors(pos, axis)
        .normalize()
        .multiplyScalar(0.9 + Math.random() * 0.7)
    })
  }, [selected.id, selected.tracks.length])

  useFrame((_, rawDt) => {
    const dt   = Math.min(rawDt, 0.05)
    const pos  = posRef.current
    const vel  = velRef.current
    if (pos.length !== selected.tracks.length) return

    for (let i = 0; i < pos.length; i++) {
      const p = pos[i]
      const v = vel[i]

      // 1. Orbit spring — pulls orb toward sphere surface at TARGET_R
      const r = p.length()
      if (r > 0.001) {
        const springMag = (TARGET_R - r) * K_SPRING
        v.x += (p.x / r) * springMag * dt
        v.y += (p.y / r) * springMag * dt
        v.z += (p.z / r) * springMag * dt
      }

      // 2. Inter-orb repulsion
      for (let j = 0; j < pos.length; j++) {
        if (i === j) continue
        const dx = p.x - pos[j].x
        const dy = p.y - pos[j].y
        const dz = p.z - pos[j].z
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < MIN_SEP * MIN_SEP && d2 > 0.0001) {
          const d = Math.sqrt(d2)
          const mag = K_REPEL * ((MIN_SEP - d) / MIN_SEP) ** 2 / d
          v.x += dx * mag * dt
          v.y += dy * mag * dt
          v.z += dz * mag * dt
        }
      }

      // 3. Tiny random perturbation — keeps the system from going static
      v.x += (Math.random() - 0.5) * NOISE * dt
      v.y += (Math.random() - 0.5) * NOISE * dt
      v.z += (Math.random() - 0.5) * NOISE * dt

      // 4. Exponential damping (time-independent)
      const damp = Math.exp(-DAMP * dt)
      v.x *= damp; v.y *= damp; v.z *= damp

      // 5. Integrate
      p.x += v.x * dt
      p.y += v.y * dt
      p.z += v.z * dt
    }
  })

  const ctx = useMemo(() => ({ positions: posRef }), [])

  return (
    <TrackPhysicsCtx.Provider value={ctx}>
      {selected.tracks.map((track, i) => (
        <TrackOrb
          key={track.url}
          physicsIndex={i}
          name={track.name}
          color={selected.theme.nodes[(i % 6) + 1]}
          ink={selected.theme.ink}
          base={selected.theme.base}
          fontClass={selected.theme.display}
          active={currentUrl === track.url}
          isPlaying={isPlaying}
          hoverCapable={hoverCapable}
          revealed={revealedId === track.url}
          visited={visitedTrackUrls.has(track.url)}
          onReveal={() => setRevealedId(track.url)}
          onPlay={() => onSelectTrack(selected, i)}
          scifi={scifi}
        />
      ))}
    </TrackPhysicsCtx.Provider>
  )
}

function SceneInfoButton() {
  const [open, setOpen] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const divRef   = useRef<HTMLDivElement>(null)
  const openRef  = useRef(false)
  openRef.current = open
  // stable target for the "open" position (in front of the orb cluster)
  const openPos = useMemo(() => new THREE.Vector3(0, 0, 5.5), [])

  useFrame(({ clock }) => {
    const g   = groupRef.current
    const div = divRef.current
    if (!g || !div) return

    if (openRef.current) {
      // Gently float toward a readable front-center position
      g.position.lerp(openPos, 0.04)
      div.style.opacity = "1"
      return
    }

    // Slow orbit around the orb cluster, drifting in Y too
    const t  = clock.elapsedTime
    const rx = 4.3, rz = 3.5
    g.position.x = Math.sin(t * 0.07) * rx
    g.position.z = Math.cos(t * 0.07) * rz
    g.position.y = Math.sin(t * 0.053 + 1.6) * 2.6

    // Fade: near-invisible at the back (z ≈ -rz), subtly visible at the front (z ≈ +rz)
    const norm = (g.position.z + rz) / (rz * 2)         // 0 → 1 back→front
    div.style.opacity = String(Math.max(0.06, norm * 0.55))
  })

  return (
    <group ref={groupRef}>
      <Html center zIndexRange={[40, 0]}>
        <div ref={divRef} style={{ position: "relative", display: "inline-block", opacity: 0.06 }}>
          {open && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.93)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 16,
                padding: "12px 16px",
                width: 210,
                color: "#0a0a0e",
                fontSize: 13,
                lineHeight: 1.6,
                boxShadow: "0 4px 28px rgba(0,0,0,0.14)",
                textAlign: "center",
                whiteSpace: "normal",
                pointerEvents: "auto",
                fontFamily: "inherit",
              }}
            >
              have fun and say yo :)
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: open ? "#f97316" : "rgba(255,255,255,0.12)",
              border: `1.5px solid ${open ? "#f97316" : "rgba(255,255,255,0.28)"}`,
              color: open ? "#fff" : "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              userSelect: "none",
              WebkitUserSelect: "none",
              fontFamily: "inherit",
              lineHeight: "1",
            } as React.CSSProperties}
          >
            ?
          </button>
        </div>
      </Html>
    </group>
  )
}

function SearchOrb({ albums, onSelectAlbum, onJumpToTrack }: {
  albums: Album[]
  onSelectAlbum: (id: string) => void
  onJumpToTrack: (album: Album, index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const groupRef = useRef<THREE.Group>(null)
  const divRef   = useRef<HTMLDivElement>(null)
  const openRef  = useRef(false)
  openRef.current = open
  const openPos = useMemo(() => new THREE.Vector3(2, -1.5, 5.5), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: { album: Album; trackIdx?: number; label: string }[] = []
    for (const album of albums) {
      if (album.title.toLowerCase().includes(q)) out.push({ album, label: album.title })
      album.tracks.forEach((t, i) => {
        if (t.name.toLowerCase().includes(q)) out.push({ album, trackIdx: i, label: `${t.name} — ${album.title}` })
      })
    }
    return out.slice(0, 7)
  }, [query, albums])

  useFrame(({ clock }) => {
    const g = groupRef.current; const div = divRef.current
    if (!g || !div) return
    if (openRef.current) { g.position.lerp(openPos, 0.04); div.style.opacity = "1"; return }
    const t = clock.elapsedTime + 2.2
    const rx = 4.3, rz = 3.5
    g.position.x = Math.sin(t * 0.07) * rx
    g.position.z = Math.cos(t * 0.07) * rz
    g.position.y = Math.sin(t * 0.053 + 1.6) * 2.6
    const norm = (g.position.z + rz) / (rz * 2)
    div.style.opacity = String(Math.max(0.06, norm * 0.55))
  })

  const btnStyle: React.CSSProperties = {
    width: 26, height: 26, borderRadius: "50%",
    background: open ? "#f97316" : "rgba(255,255,255,0.12)",
    border: `1.5px solid ${open ? "#f97316" : "rgba(255,255,255,0.28)"}`,
    color: open ? "#fff" : "rgba(255,255,255,0.7)",
    fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(6px)", userSelect: "none", fontFamily: "inherit", lineHeight: "1",
  }

  return (
    <group ref={groupRef}>
      <Html center zIndexRange={[40, 0]}>
        <div ref={divRef} style={{ position: "relative", display: "inline-block", opacity: 0.06 }}>
          {open && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.93)", backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)", borderRadius: 16,
              padding: "10px 12px", width: 240, color: "#0a0a0e", fontSize: 13,
              boxShadow: "0 4px 28px rgba(0,0,0,0.14)", pointerEvents: "auto", fontFamily: "inherit",
            }}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="search tracks or albums…"
                style={{
                  width: "100%", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8,
                  padding: "6px 10px", fontSize: 13, outline: "none",
                  background: "rgba(0,0,0,0.04)", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              {results.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 1 }}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => {
                      r.trackIdx !== undefined ? onJumpToTrack(r.album, r.trackIdx) : onSelectAlbum(r.album.id)
                      setOpen(false); setQuery("")
                    }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "5px 8px", borderRadius: 6, background: "transparent",
                      border: "none", cursor: "pointer", fontSize: 12,
                      color: "#0a0a0e", fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.07)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                    >
                      {r.trackIdx !== undefined ? "♪ " : "⦿ "}{r.label}
                    </button>
                  ))}
                </div>
              )}
              {query.trim() !== "" && results.length === 0 && (
                <p style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>no results</p>
              )}
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); setOpen(o => !o); if (open) setQuery("") }}
            onPointerDown={e => e.stopPropagation()}
            style={btnStyle}
          >
            🔍
          </button>
        </div>
      </Html>
    </group>
  )
}

function StarField() {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 90
      pos[i * 3 + 1] = (Math.random() - 0.5) * 90
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90 - 10
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.006 })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.045} color="#c8e4ff" transparent opacity={0.65} sizeAttenuation />
    </points>
  )
}

function SimpleModeOrb({ onActivate }: { onActivate: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const divRef   = useRef<HTMLDivElement>(null)

  useFrame(({ clock }) => {
    const g = groupRef.current; const div = divRef.current
    if (!g || !div) return
    const t = clock.elapsedTime + 4.4
    const rx = 4.3, rz = 3.5
    g.position.x = Math.sin(t * 0.07) * rx
    g.position.z = Math.cos(t * 0.07) * rz
    g.position.y = Math.sin(t * 0.053 + 1.6) * 2.6
    const norm = (g.position.z + rz) / (rz * 2)
    div.style.opacity = String(Math.max(0.06, norm * 0.55))
  })

  return (
    <group ref={groupRef}>
      <Html center zIndexRange={[40, 0]}>
        <div ref={divRef} style={{ display: "inline-block", opacity: 0.06 }}>
          <button
            onClick={e => { e.stopPropagation(); onActivate() }}
            onPointerDown={e => e.stopPropagation()}
            title="Simple mode"
            style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(6px)", userSelect: "none", fontFamily: "inherit", lineHeight: "1",
            } as React.CSSProperties}
          >
            ≡
          </button>
        </div>
      </Html>
    </group>
  )
}

function Scene({
  albums, selectedId, onSelectAlbum, currentUrl, onSelectTrack,
  isPlaying, hoverCapable, revealedId, setRevealedId, visitedIds, visitedTrackUrls,
  onJumpToTrack, onActivateSimpleMode, scifi,
}: {
  albums: Album[]; selectedId: string | null
  onSelectAlbum: (id: string | null) => void; currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void; isPlaying: boolean
  hoverCapable: boolean; revealedId: string | null
  setRevealedId: (id: string | null) => void; visitedIds: Set<string>
  visitedTrackUrls: Set<string>
  onJumpToTrack: (album: Album, index: number) => void
  onActivateSimpleMode: () => void
  scifi?: boolean
}) {
  const selected = albums.find((a) => a.id === selectedId) ?? null
  const albumPositions = useMemo(() => fibSphere(albums.length, 4.3, 1.5), [albums.length])
  const lightA = selected ? selected.theme.nodes[0] : "#8fb7d6"
  const lightB = selected ? selected.theme.nodes[2] : "#c98fd6"

  return (
    <>
      <ambientLight intensity={scifi ? 0.15 : 0.3} color={scifi ? "#6080ff" : "#ffffff"} />
      <PointerLights colorA={lightA} colorB={lightB} />
      {scifi && <StarField />}

      {albums.map((album, i) => (
        <AlbumOrb
          key={album.id} album={album}
          basePosition={album.shape === "tetrahedron" ? [0, 0, 0] : albumPositions[i]}
          selected={selectedId === album.id} anySelected={selectedId !== null}
          isPlaying={isPlaying} hoverCapable={hoverCapable}
          revealed={revealedId === album.id} visited={visitedIds.has(album.id)}
          onReveal={() => setRevealedId(album.id)}
          onSelect={() => onSelectAlbum(album.id)}
          onBack={() => onSelectAlbum(null)}
          scifi={scifi}
        />
      ))}

      {!selected && <SceneInfoButton />}
      {!selected && <SearchOrb albums={albums} onSelectAlbum={id => onSelectAlbum(id)} onJumpToTrack={onJumpToTrack} />}
      {!selected && <SimpleModeOrb onActivate={onActivateSimpleMode} />}

      {selected && (
        <TrackOrbsPhysics
          selected={selected}
          currentUrl={currentUrl}
          isPlaying={isPlaying}
          hoverCapable={hoverCapable}
          revealedId={revealedId}
          setRevealedId={setRevealedId}
          onSelectTrack={onSelectTrack}
          visitedTrackUrls={visitedTrackUrls}
          scifi={scifi}
        />
      )}

      <OrbitControls enableDamping dampingFactor={0.05} enablePan={false}
        enableZoom rotateSpeed={0.5} zoomSpeed={0.6}
        minDistance={6} maxDistance={24} target={[0, 0, 0]} />
    </>
  )
}

export function OrbScene(props: {
  albums: Album[]; selectedId: string | null
  onSelectAlbum: (id: string | null) => void; currentUrl: string | null
  onSelectTrack: (album: Album, index: number) => void; isPlaying: boolean
  visitedIds: Set<string>; visitedTrackUrls: Set<string>
  onJumpToTrack: (album: Album, index: number) => void
  onActivateSimpleMode: () => void
  scifi?: boolean
}) {
  const [hoverCapable, setHoverCapable] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setHoverCapable(mq.matches)
    const on = () => setHoverCapable(mq.matches)
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])

  // Zoom out a bit on narrow/mobile viewports so the taller ellipsoid stays in frame
  const [camZ] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 17 : 13,
  )

  const [revealedId, setRevealedId] = useState<string | null>(null)
  useEffect(() => setRevealedId(null), [props.selectedId])

  const handleMissed = () => {
    if (revealedId) setRevealedId(null)
    else if (props.selectedId === null) props.onSelectAlbum(null)
  }

  return (
    <Canvas className="absolute inset-0"
      camera={{ position: [0, 0, camZ], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]} onPointerMissed={handleMissed}
    >
      <Scene {...props} hoverCapable={hoverCapable}
        revealedId={revealedId} setRevealedId={setRevealedId}
        visitedIds={props.visitedIds} visitedTrackUrls={props.visitedTrackUrls}
        scifi={props.scifi} />
    </Canvas>
  )
}
