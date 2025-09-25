"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface RangaModelProps {
  audioData: any
  morphingEffect: number
  bulgeEffect: number
  noiseDistortion: number
  waveDistortion: number
  rangaLightEmission: number
  statueX: number
  statueY: number
  statueZ: number
  lightPositions: THREE.Vector3[]
  shuKnob: number
  onModelLoaded: () => void
  isMobile: boolean
  isLowPerformanceMode: boolean
}

function RangaModelInner(props: RangaModelProps) {
  const {
    audioData,
    morphingEffect,
    bulgeEffect,
    noiseDistortion,
    waveDistortion,
    rangaLightEmission,
    statueX,
    statueY,
    statueZ,
    lightPositions,
    shuKnob,
    onModelLoaded,
    isMobile,
    isLowPerformanceMode,
  } = props

  const statueRef = useRef<any>(null)
  const originalPositionsRef = useRef<Float32Array | null>(null)
  const rangaLightRef = useRef<THREE.PointLight>(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Pre-allocated reusable Vector3 objects to avoid garbage collection
  const reusableVertex = useRef(new THREE.Vector3())
  const reusableDisplacement = useRef(new THREE.Vector3())
  const reusableNormal = useRef(new THREE.Vector3())

  // Load the GLTF model
  const { scene } = useGLTF("/ranga/models/ranga-to-stone.glb")

  // Try to load texture with fallback
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    // Try to load the stone texture, with fallback to a basic material
    loader.load(
      "/textures/stone.png",
      (loadedTexture) => {
        console.log("Texture loaded successfully")
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping
        loadedTexture.repeat.set(2, 2)
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.log("Texture not found, using fallback material")
        // Don't set texture, will use fallback material
      },
    )
  }, [])

  // Light effect based on audio
  useEffect(() => {
    if (rangaLightRef.current) {
      const intensity = rangaLightEmission * (audioData.volume + 0.2)
      rangaLightRef.current.intensity = Math.min(2, intensity)

      if (rangaLightEmission > 0.5) {
        const hue = (Date.now() * 0.001) % 1
        rangaLightRef.current.color.setHSL(hue, 1, 0.5)
      } else {
        rangaLightRef.current.color.set("#ffffff")
      }
    }
  }, [rangaLightEmission, audioData.volume])

  useEffect(() => {
    if (scene && !modelLoaded) {
      console.log("Model loaded successfully")

      scene.traverse((child) => {
        if (child.type === "Mesh") {
          statueRef.current = child
          const mesh = child as any

          // Create material with or without texture
          const material = texture
            ? new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.6,
                metalness: 0.1,
                color: "#ffffff",
              })
            : new THREE.MeshStandardMaterial({
                color: "#a89b7a",
                roughness: 0.7,
                metalness: 0.05,
              })

          mesh.material = material
          mesh.castShadow = true
          mesh.receiveShadow = true

          if (mesh.geometry && mesh.geometry.attributes.position) {
            originalPositionsRef.current = new Float32Array(mesh.geometry.attributes.position.array)
            mesh.geometry.computeVertexNormals()
          }
        }
      })

      setModelLoaded(true)
      onModelLoaded()
    }
  }, [scene, texture, modelLoaded, onModelLoaded])

  useFrame((state) => {
    if (!statueRef.current || !originalPositionsRef.current) return
    const time = state.clock.elapsedTime
    const mesh = statueRef.current

    if (!mesh.geometry || !mesh.geometry.attributes.position) return

    // Early exit condition - skip processing if no effects are active
    const hasEffects = morphingEffect > 0.01 || bulgeEffect > 0.01 ||
                      noiseDistortion > 0.01 || waveDistortion > 0.01
    if (!hasEffects) {
      // Reset to original positions if no effects are active
      const positions = mesh.geometry.attributes.position.array
      const originalPositions = originalPositionsRef.current
      for (let i = 0; i < positions.length; i++) {
        positions[i] = originalPositions[i]
      }
      mesh.geometry.attributes.position.needsUpdate = true
      mesh.geometry.computeVertexNormals()
      return
    }

    const positions = mesh.geometry.attributes.position.array
    const originalPositions = originalPositionsRef.current
    const vertexCount = positions.length / 3

    // Model space scale factor for coordinate system conversion
    const modelSpaceScale = 0.014

    // Audio reactivity adjusted for model space calculations
    const mobileMultiplier = isMobile ? 0.5 : 1
    const bassReactive = Math.max(0, (audioData.bassLevel || 0) * 25 * mobileMultiplier)
    const midReactive = Math.max(0, (audioData.midLevel || 0) * 25 * mobileMultiplier)
    const trebleReactive = Math.max(0, (audioData.trebleLevel || 0) * 25 * mobileMultiplier)
    const volumeReactive = Math.max(0, (audioData.volume || 0) * 50 * mobileMultiplier)

    // Cache time-based calculations that are used repeatedly
    const time2 = time * 2
    const time3 = time * 3
    const sinTime3 = Math.sin(time3)
    const sinTime2 = Math.sin(time2)
    const cosTime = Math.cos(time)

    for (let i = 0; i < positions.length; i += 3) {
      const vertexIndex = i / 3
      // Reuse Vector3 objects instead of creating new ones
      reusableVertex.current.set(originalPositions[i], originalPositions[i + 1], originalPositions[i + 2])
      const vertex = reusableVertex.current

      reusableDisplacement.current.set(0, 0, 0)
      const displacement = reusableDisplacement.current

      // Morphing effect based on shuKnob - skip if effect is too small
      if (morphingEffect > 0.01) {
        const timeBasedMovement = Math.sin(time3) * 0.05

        // Complex phase calculation scaled for model space (0.014 scale factor)
        const morphPhase = Math.sin(time * 0.5 + (vertex.x + vertex.y + vertex.z) * modelSpaceScale * 2)

        // Multi-directional morphing vectors scaled for model space
        const morphDirectionX = Math.sin(time * 0.3 + vertex.y * modelSpaceScale * 5)
        const morphDirectionY = Math.cos(time * 0.4 + vertex.x * modelSpaceScale * 5)
        const morphDirectionZ = Math.sin(time * 0.2 + vertex.z * modelSpaceScale * 5)

        // Normalize the direction vector
        const morphLength = Math.sqrt(morphDirectionX * morphDirectionX +
                                     morphDirectionY * morphDirectionY +
                                     morphDirectionZ * morphDirectionZ)
        const normalizedX = morphDirectionX / (morphLength || 1)
        const normalizedY = morphDirectionY / (morphLength || 1)
        const normalizedZ = morphDirectionZ / (morphLength || 1)

        // Audio-reactive morphing intensity matching old implementation
        const morphIntensity = (bassReactive + midReactive + trebleReactive + timeBasedMovement + 1) *
                              morphingEffect * morphPhase * 0.5

        // Apply normalized directional morphing
        displacement.x += normalizedX * morphIntensity
        displacement.y += normalizedY * morphIntensity
        displacement.z += normalizedZ * morphIntensity
      }

      // Bulge effect (Theta knob) - skip if effect is too small
      if (bulgeEffect > 0.01) {
        const timeBasedMovement = Math.sin(time * 0.5) * 0.1 * mobileMultiplier
        // Calculate distance from model center in model space (equivalent to statue center in world space)
        const modelSpaceCenter = { x: 0, y: -71.4, z: 0 } // (statueY - 1) / 0.014 ≈ -71.4
        const distanceFromCenter = Math.sqrt(
          Math.pow(vertex.x - modelSpaceCenter.x, 2) +
          Math.pow(vertex.y - modelSpaceCenter.y, 2) +
          Math.pow(vertex.z - modelSpaceCenter.z, 2)
        )
        // Scale distance calculation for model space
        const scaledDistance = distanceFromCenter * modelSpaceScale
        const bulgeAmount = Math.exp(-scaledDistance * 2.0) * bulgeEffect * (volumeReactive + timeBasedMovement + 1) * 1.0
        // Use original vertex position for direction (like old implementation)
        reusableNormal.current.set(originalPositions[i], originalPositions[i + 1], originalPositions[i + 2]).normalize()
        const normal = reusableNormal.current
        displacement.add(normal.multiplyScalar(bulgeAmount))
      }

      // Noise distortion based on light positions - skip if effect is too small
      if (noiseDistortion > 0.01 && lightPositions.length > 0) {
        const timeBasedMovement = Math.sin(time3) * 0.05
        // Use for loop instead of forEach for better performance
        for (let j = 0; j < lightPositions.length; j++) {
          const distToLight = vertex.distanceTo(lightPositions[j])
          const influence = Math.max(0, 1 - distToLight / 100)

          // Skip if influence is negligible
          if (influence > 0.01) {
            const randomNoise = (Math.random() - 0.5) * 0.3
            const structuredNoise = Math.sin(vertex.x * modelSpaceScale * 10 + time * 2) * Math.cos(vertex.y * modelSpaceScale * 8 + time * 1.5) * 0.4
            const combinedNoise = (randomNoise + structuredNoise) * noiseDistortion * (midReactive + timeBasedMovement + 1) * 0.8 * influence
            displacement.x += combinedNoise
            displacement.y += combinedNoise * 0.7
            displacement.z += combinedNoise * 0.9
          }
        }
      }

      // Wave distortion - skip if effect is too small
      if (waveDistortion > 0.01) {
        const timeBasedMovement = sinTime3 * 0.05  // Use cached sinTime3
        // Convert statue position to model space equivalent for wave calculation
        const statueXInModelSpace = 0  // Since model is centered and positioned via group transform
        const wave = Math.sin((vertex.x - statueXInModelSpace) * modelSpaceScale * 5 + time * 3) *
                    waveDistortion *
                    (trebleReactive + timeBasedMovement + 1) *
                    1.0
        displacement.y += wave
      }

      // Skip position update if displacement is zero to save CPU cycles
      if (displacement.x !== 0 || displacement.y !== 0 || displacement.z !== 0) {
        positions[i] = originalPositions[i] + displacement.x
        positions[i + 1] = originalPositions[i + 1] + displacement.y
        positions[i + 2] = originalPositions[i + 2] + displacement.z
      }
    }
    mesh.geometry.attributes.position.needsUpdate = true

    // Only recompute normals if we have bulge or wave effects (which affect surface normals)
    if (bulgeEffect > 0.01 || waveDistortion > 0.01) {
      mesh.geometry.computeVertexNormals()
    }
  })

  if (!scene) {
    // Fallback to a simple box geometry if model fails to load
    return (
      <group position={[statueX, statueY, statueZ]} rotation={[0, (304 * Math.PI) / 180, 0]}>
        <mesh>
          <boxGeometry args={[2, 3, 2]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
        <pointLight
          ref={rangaLightRef}
          color="#ffffff"
          intensity={1}
          distance={10}
          decay={1}
          position={[0, 50, 0]}
        />
        <pointLight position={[0, 100, 0]} color="#FFA500" intensity={0.5} distance={200} decay={1} />
      </group>
    )
  }

  return (
    <group position={[statueX, statueY, statueZ]} rotation={[0, (304 * Math.PI) / 180, 0]} scale={[0.014, 0.014, 0.014]}>
      <primitive object={scene} />
      <pointLight ref={rangaLightRef} color="#ffffff" intensity={1} distance={10} decay={1} position={[0, 50, 0]} />
      <pointLight position={[0, 100, 0]} color="#FFA500" intensity={0.5} distance={200} decay={1} />
    </group>
  )
}

// Wrap the component to ensure it only loads on client
export default function RangaModel(props: RangaModelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <group position={[props.statueX, props.statueY, props.statueZ]}>
        <mesh>
          <boxGeometry args={[2, 3, 2]} />
          <meshBasicMaterial color="#8B7355" />
        </mesh>
      </group>
    )
  }

  return <RangaModelInner {...props} />
}