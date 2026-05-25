"use client"

import { useRef } from "react"
import * as THREE from "three"

export function OneWayMirror() {
  const mirrorRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={mirrorRef} position={[0, 0, 6]} rotation={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.05}
        emissive="#ffffff"
        emissiveIntensity={0.2}
        transparent
        opacity={0.3}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
