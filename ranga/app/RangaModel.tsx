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
  const { scene } = useGLTF("/models/ranga-to-stone.glb")

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
                roughness: 0.8,
                metalness: 0.2,
                color: "#ffffff",
              })
            : new THREE.MeshStandardMaterial({
                color: "#8B7355",
                roughness: 0.9,
                metalness: 0.1,
              })

          mesh.material = material
          mesh.castShadow = true
          mesh.receiveShadow = true

          if (mesh.geometry && mesh.geometry.attributes.position) {
            originalPositionsRef.current = new Float32Array(mesh.geometry.attributes.position.array)
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
      return
    }

    const positions = mesh.geometry.attributes.position.array
    const originalPositions = originalPositionsRef.current
    const vertexCount = positions.length / 3

    // Audio reactivity
    const bassReactive = audioData.bassLevel || 0
    const midReactive = audioData.midLevel || 0
    const trebleReactive = audioData.trebleLevel || 0

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
        const morphAmount = morphingEffect * 0.5
        const morphFreq = time2 + vertexIndex * 0.1  // Use cached time2
        displacement.x += Math.sin(morphFreq) * morphAmount * bassReactive
        displacement.y += Math.cos(morphFreq * 1.3) * morphAmount * midReactive
        displacement.z += Math.sin(morphFreq * 0.7) * morphAmount * trebleReactive
      }

      // Bulge effect (Theta knob) - skip if effect is too small
      if (bulgeEffect > 0.01) {
        const distance = vertex.length()
        const bulgeAmount = Math.sin(distance * 0.5 - time2) * bulgeEffect * 2  // Use cached time2
        // Reuse normal vector instead of cloning
        reusableNormal.current.copy(vertex).normalize()
        const normal = reusableNormal.current
        displacement.add(normal.multiplyScalar(bulgeAmount * (bassReactive + 0.2)))
      }

      // Noise distortion based on light positions - skip if effect is too small
      if (noiseDistortion > 0.01 && lightPositions.length > 0) {
        // Use for loop instead of forEach for better performance
        for (let j = 0; j < lightPositions.length; j++) {
          const distToLight = vertex.distanceTo(lightPositions[j])
          const influence = Math.max(0, 1 - distToLight / 100)

          // Skip if influence is negligible
          if (influence > 0.01) {
            const noiseAmount = influence * noiseDistortion * 10
            // Use single random value for all axes (more coherent noise)
            const randomValue = (Math.random() - 0.5) * noiseAmount
            displacement.x += randomValue
            displacement.y += randomValue * 0.8  // Slightly different for variation
            displacement.z += randomValue * 1.2  // Slightly different for variation
          }
        }
      }

      // Wave distortion - skip if effect is too small
      if (waveDistortion > 0.01) {
        const timeBasedMovement = sinTime3 * 0.05  // Use cached sinTime3
        const wave =
          Math.sin(vertex.y * 0.1 + time2) *  // Use cached time2
          Math.cos(vertex.x * 0.1 + time) *
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