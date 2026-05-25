"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function GradientDisk({ audioData, isPlaying }: { audioData: Float32Array | null; isPlaying: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_point1_pos: { value: new THREE.Vector2(0.5, 0.5) },
    u_point1_color: { value: new THREE.Vector3(0, 1, 0.3) },
    u_point1_opacity: { value: 1 },
    u_point2_pos: { value: new THREE.Vector2(0.5, 0.5) },
    u_point2_color: { value: new THREE.Vector3(0.8, 0, 1) },
    u_point2_opacity: { value: 1 },
    u_point3_pos: { value: new THREE.Vector2(0.5, 0.5) },
    u_point3_color: { value: new THREE.Vector3(1, 0.5, 0) },
    u_point3_opacity: { value: 1 },
  }), [])

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying || !audioData) return
    const material = meshRef.current.material as THREE.ShaderMaterial
    timeRef.current += delta
    const bl = audioData.length
    if (Array.from(audioData).reduce((s, v) => s + v, 0) < 10) return
    const norm = (s: number, e: number) => { const sl = audioData.slice(s, e); return Math.min(sl.reduce((a, v) => a + v, 0) / sl.length / 128, 1) }
    const nL = norm(0, Math.floor(bl * 0.1)), nM = norm(Math.floor(bl * 0.3), Math.floor(bl * 0.6)), nH = norm(Math.floor(bl * 0.6), bl)
    const gr = 0.2 + nL * 0.3
    material.uniforms.u_point1_pos.value.set(0.5 + Math.cos(timeRef.current * 0.8) * gr, 0.5 + Math.sin(timeRef.current * 0.8) * gr)
    material.uniforms.u_point1_opacity.value = 0.5 + nL * 0.5
    const pr = 0.15 + nM * 0.25
    material.uniforms.u_point2_pos.value.set(0.5 + Math.cos(timeRef.current * -1.2) * pr, 0.5 + Math.sin(timeRef.current * -1.2) * pr)
    material.uniforms.u_point2_opacity.value = 0.6 + nM * 0.4
    material.uniforms.u_point3_pos.value.set(0.5 + Math.sin(timeRef.current * 1.5) * 0.25 * nH, 0.5 + Math.sin(timeRef.current * 3) * 0.2 * nH)
    material.uniforms.u_point3_opacity.value = 0.4 + nH * 0.6
    material.uniforms.u_time.value = timeRef.current
  })

  const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
  const fragmentShader = `
    uniform vec2 u_point1_pos; uniform vec3 u_point1_color; uniform float u_point1_opacity;
    uniform vec2 u_point2_pos; uniform vec3 u_point2_color; uniform float u_point2_opacity;
    uniform vec2 u_point3_pos; uniform vec3 u_point3_color; uniform float u_point3_opacity;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float circleMask = smoothstep(0.5, 0.3, distance(uv, vec2(0.5)));
      float d1 = distance(uv, u_point1_pos), d2 = distance(uv, u_point2_pos), d3 = distance(uv, u_point3_pos);
      float i1 = 1.0/(d1*d1*2.0+0.05)*u_point1_opacity, i2 = 1.0/(d2*d2*2.0+0.05)*u_point2_opacity, i3 = 1.0/(d3*d3*2.0+0.05)*u_point3_opacity;
      vec3 color = (u_point1_color*i1+u_point2_color*i2+u_point3_color*i3)/(i1+i2+i3) * 2.0;
      gl_FragColor = vec4(color, circleMask * 0.7);
    }
  `

  return (
    <mesh ref={meshRef} position={[0, 0, 0.5]}>
      <circleGeometry args={[3, 128]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} />
    </mesh>
  )
}
