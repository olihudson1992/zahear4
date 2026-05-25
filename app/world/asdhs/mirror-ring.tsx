"use client"

import { useRef } from "react"
import type * as THREE from "three"

export function MirrorRing() {
  const ringRef = useRef<THREE.Mesh>(null)

  // Disk radius is 3, so 75% of that is 2.25
  const radius = 2.25
  const tubeRadius = 0.25 // Depth of the ring

  return (
    <mesh ref={ringRef} position={[0, 0, 2]} rotation={[0, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 32, 64]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.05}
        envMapIntensity={3}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}
