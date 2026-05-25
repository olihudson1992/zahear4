"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { ColorPoint } from "./page"

type GradientPlaneProps = {
  colorPoints: ColorPoint[]
  setColorPoints: (points: ColorPoint[]) => void
  audioData: Float32Array | null
  isPlaying: boolean
}

export function GradientPlane({ colorPoints, setColorPoints, audioData, isPlaying }: GradientPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)
  const smoothedAudioRef = useRef({ low: 0, lowMid: 0, highMid: 0, high: 0 })

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_point1_pos: { value: new THREE.Vector2(colorPoints[0].position[0], colorPoints[0].position[1]) },
    u_point1_color: { value: new THREE.Vector3(...colorPoints[0].color) },
    u_point1_opacity: { value: colorPoints[0].opacity },
    u_point2_pos: { value: new THREE.Vector2(colorPoints[1].position[0], colorPoints[1].position[1]) },
    u_point2_color: { value: new THREE.Vector3(...colorPoints[1].color) },
    u_point2_opacity: { value: colorPoints[1].opacity },
    u_point3_pos: { value: new THREE.Vector2(colorPoints[2].position[0], colorPoints[2].position[1]) },
    u_point3_color: { value: new THREE.Vector3(...colorPoints[2].color) },
    u_point3_opacity: { value: colorPoints[2].opacity },
    u_point4_pos: { value: new THREE.Vector2(colorPoints[3].position[0], colorPoints[3].position[1]) },
    u_point4_color: { value: new THREE.Vector3(...colorPoints[3].color) },
    u_point4_opacity: { value: colorPoints[3].opacity },
    u_point5_pos: { value: new THREE.Vector2(colorPoints[4].position[0], colorPoints[4].position[1]) },
    u_point5_color: { value: new THREE.Vector3(...colorPoints[4].color) },
    u_point5_opacity: { value: colorPoints[4].opacity },
  }), [colorPoints])

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying || !audioData) return
    const material = meshRef.current.material as THREE.ShaderMaterial
    timeRef.current += delta
    const bufferLength = audioData.length
    if (Array.from(audioData).reduce((s, v) => s + v, 0) < 10) return

    const lowFreq = audioData.slice(0, Math.floor(bufferLength * 0.1))
    const lowMidFreq = audioData.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.3))
    const highMidFreq = audioData.slice(Math.floor(bufferLength * 0.3), Math.floor(bufferLength * 0.6))
    const highFreq = audioData.slice(Math.floor(bufferLength * 0.6), bufferLength)

    const norm = (arr: Float32Array) => Math.min(arr.reduce((s, v) => s + v, 0) / arr.length / 128, 1)
    const sf = 0.15
    smoothedAudioRef.current.low += (norm(lowFreq) - smoothedAudioRef.current.low) * sf
    smoothedAudioRef.current.lowMid += (norm(lowMidFreq) - smoothedAudioRef.current.lowMid) * sf
    smoothedAudioRef.current.highMid += (norm(highMidFreq) - smoothedAudioRef.current.highMid) * sf
    smoothedAudioRef.current.high += (norm(highFreq) - smoothedAudioRef.current.high) * sf

    const s = smoothedAudioRef.current
    const newPoints = [...colorPoints]
    const cr = 0.6, cs = 0.5
    newPoints[0] = { ...newPoints[0], position: [0.5 + Math.cos(timeRef.current * cs) * cr * (0.3 + s.highMid * 0.7), 0.5 + Math.sin(timeRef.current * cs) * cr * (0.3 + s.highMid * 0.7)], opacity: 0.5 + s.highMid * 0.5 }
    const bp = newPoints[3].position
    newPoints[1] = { ...newPoints[1], position: [0.5 + ((bp[0] < 0.5 ? 0.9 : 0.1) - 0.5) * (0.5 + s.lowMid * 0.5), 0.5 + ((bp[1] < 0.5 ? 0.9 : 0.1) - 0.5) * (0.5 + s.lowMid * 0.5)], opacity: 0.4 + s.lowMid * 0.6 }
    newPoints[2] = { ...newPoints[2], position: [0.5 + Math.sin(timeRef.current * 0.7) * 0.4 * (0.5 + s.highMid * 0.5), 0.5 + Math.cos(timeRef.current * 0.7) * 0.4 * (0.5 + s.highMid * 0.5)], opacity: 0.3 + s.highMid * 0.7 }
    newPoints[3] = { ...newPoints[3], position: [0.5 + Math.sin(timeRef.current * 0.3) * 0.3 * s.low, 0.1 + s.low * 0.6], opacity: 0.6 + s.low * 0.4 }
    newPoints[4] = { ...newPoints[4], position: [0.5 + Math.cos(timeRef.current * 0.6) * 0.3 * s.high, 0.9 - s.high * 0.4], opacity: 0.5 + s.high * 0.5 }

    setColorPoints(newPoints)
    newPoints.forEach((point, index) => {
      const i = index + 1
      material.uniforms[`u_point${i}_pos`].value.set(point.position[0], point.position[1])
      material.uniforms[`u_point${i}_color`].value.set(...point.color)
      material.uniforms[`u_point${i}_opacity`].value = point.opacity
    })
  })

  const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_point1_pos; uniform vec3 u_point1_color; uniform float u_point1_opacity;
    uniform vec2 u_point2_pos; uniform vec3 u_point2_color; uniform float u_point2_opacity;
    uniform vec2 u_point3_pos; uniform vec3 u_point3_color; uniform float u_point3_opacity;
    uniform vec2 u_point4_pos; uniform vec3 u_point4_color; uniform float u_point4_opacity;
    uniform vec2 u_point5_pos; uniform vec3 u_point5_color; uniform float u_point5_opacity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float d1 = distance(uv, u_point1_pos), d2 = distance(uv, u_point2_pos), d3 = distance(uv, u_point3_pos), d4 = distance(uv, u_point4_pos), d5 = distance(uv, u_point5_pos);
      float i1 = 1.0/(d1*d1+0.1)*u_point1_opacity, i2 = 1.0/(d2*d2+0.1)*u_point2_opacity, i3 = 1.0/(d3*d3+0.1)*u_point3_opacity, i4 = 1.0/(d4*d4+0.1)*u_point4_opacity, i5 = 1.0/(d5*d5+0.1)*u_point5_opacity;
      float total = i1+i2+i3+i4+i5;
      vec3 color = (u_point1_color*i1+u_point2_color*i2+u_point3_color*i3+u_point4_color*i4+u_point5_color*i5)/total;
      gl_FragColor = vec4(color, 1.0);
    }
  `

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[8, 8, 128, 128]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}
