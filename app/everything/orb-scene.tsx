"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { useRef, useMemo, useEffect, useState } from "react"
import * as THREE from "three"

const pages = [
  { name: "asdhs",          path: "/asdhs",           color: "#00ffff" },
  { name: "demoez",         path: "/demoez",           color: "#ff00ff" },
  { name: "go",             path: "/go",               color: "#00ff88" },
  { name: "ranga",          path: "/ranga",            color: "#ffff00" },
  { name: "sing",           path: "/sing",             color: "#ff6600" },
  { name: "𝕊𝔦ＮᎶ",         path: "/𝕊𝔦ＮᎶ",           color: "#00ffaa" },
  { name: "çøřǎŧÿŵžᛉ",    path: "/çøřǎŧÿŵžᛉ",      color: "#aa00ff" },
  { name: "ǝuoɹǝʇdɐɥɔ",   path: "/ǝuoɹǝʇdɐɥɔ",     color: "#ff0088" },
  { name: "юΘف жn2gsj",    path: "/юΘف жn2gsj",      color: "#88ff00" },
  { name: "עʃᚢ",            path: "/עʃᚢ",             color: "#00aaff" },
]

function Lights({ isMobile }: { isMobile: boolean }) {
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)
  const { viewport, pointer } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 0, 4))
  const currentPos = useRef(new THREE.Vector3(0, 0, 4))

  useFrame((state) => {
    if (isMobile) {
      const t = state.clock.elapsedTime * 0.5
      currentPos.current.x = Math.sin(t) * 4
      currentPos.current.y = Math.cos(t * 0.7) * 2
      currentPos.current.z = 4 + Math.cos(t * 0.5) * 2
    } else {
      targetPos.current.x = (pointer.x * viewport.width) / 2
      targetPos.current.y = (pointer.y * viewport.height) / 2
      targetPos.current.z = 4
      currentPos.current.lerp(targetPos.current, 0.08)
    }

    if (light1Ref.current) light1Ref.current.position.copy(currentPos.current)
    if (light2Ref.current) {
      light2Ref.current.position.set(
        -currentPos.current.x * 0.5,
        -currentPos.current.y * 0.5,
        currentPos.current.z
      )
    }
  })

  return (
    <>
      <pointLight ref={light1Ref} intensity={200} color="#00ffff" distance={25} decay={2} />
      <pointLight ref={light2Ref} intensity={150} color="#ff00ff" distance={20} decay={2} />
    </>
  )
}

interface OrbProps {
  position: [number, number, number]
  color: string
  name: string
  path: string
  scale?: number
  index: number
  onHover: (name: string | null) => void
}

function Orb({ position, color, name, path, scale = 1, onHover }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const hoveredRef = useRef(false)
  const currentScale = useRef(scale)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      const targetScale = hoveredRef.current ? scale * 1.15 : scale
      currentScale.current += (targetScale - currentScale.current) * 0.1
      meshRef.current.scale.setScalar(currentScale.current)
    }
    if (glowRef.current) glowRef.current.scale.setScalar(currentScale.current * 1.2)
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1}>
      <group position={position}>
        <mesh ref={glowRef}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
        <mesh
          ref={meshRef}
          onPointerOver={() => {
            hoveredRef.current = true
            onHover(name)
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            hoveredRef.current = false
            onHover(null)
            document.body.style.cursor = "default"
          }}
          onClick={() => { window.location.href = encodeURI(path) }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh scale={0.85}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  )
}

function Orbs({ onHover }: { onHover: (name: string | null) => void }) {
  const orbData = useMemo(() => {
    return pages.map((page, i) => {
      const angle = (i / pages.length) * Math.PI * 2
      const radius = 2.5 + (i % 3) * 0.8
      const x = Math.cos(angle) * radius
      const y = (i % 2 === 0 ? 1 : -1) * (0.5 + (i % 3) * 0.5)
      const z = Math.sin(angle) * radius - 2
      const scale = 0.5 + (i % 3) * 0.15
      return { ...page, position: [x, y, z] as [number, number, number], scale }
    })
  }, [])

  return (
    <>
      {orbData.map((orb, i) => (
        <Orb
          key={orb.name}
          position={orb.position}
          color={orb.color}
          name={orb.name}
          path={orb.path}
          scale={orb.scale}
          index={i}
          onHover={onHover}
        />
      ))}
    </>
  )
}

export default function OrbScene() {
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredName, setHoveredName] = useState<string | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#030308]">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#030308"]} />
        <fog attach="fog" args={["#030308", 8, 25]} />
        <ambientLight intensity={0.05} />
        <Lights isMobile={isMobile} />
        <Orbs onHover={setHoveredName} />
      </Canvas>
      <div
        className={`pointer-events-none fixed left-1/2 top-8 -translate-x-1/2 transition-all duration-200 ${
          hoveredName ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="rounded-full border border-white/20 bg-black/60 px-6 py-2 text-lg font-light tracking-wider text-white backdrop-blur-md">
          {hoveredName}
        </div>
      </div>
    </div>
  )
}
