"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type GradientTriangleProps = {
  audioData: Float32Array | null
  isPlaying: boolean
}

export function GradientTriangle({ audioData, isPlaying }: GradientTriangleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Smoothing references for audio reactivity
  const smoothedLow = useRef(0)
  const smoothedMid = useRef(0)
  const smoothedHigh = useRef(0)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    // Base size in world units (12 pixels ≈ 0.12 units at this scale)
    const baseSize = 0.12
    const height = 0.01 // Start very flat (2D-like)

    // Triangular base vertices
    const vertices = new Float32Array([
      // Base triangle (facing down)
      0,
      -baseSize * 0.577,
      0, // Bottom vertex
      -baseSize / 2,
      baseSize * 0.289,
      0, // Top left
      baseSize / 2,
      baseSize * 0.289,
      0, // Top right

      // Apex (will be extruded with bass)
      0,
      0,
      height,
    ])

    // Indices for the pyramid faces
    const indices = new Uint16Array([
      // Base triangle
      0, 1, 2,
      // Side faces
      0, 3, 1, 1, 3, 2, 2, 3, 0,
    ])

    // UVs for texture mapping
    const uvs = new Float32Array([0.5, 0, 0, 1, 1, 1, 0.5, 0.5])

    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    geo.setIndex(Array.from(indices))
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
    geo.computeVertexNormals()

    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_displacement: { value: 0 },
      u_turbulence: { value: 0 },
      u_blur: { value: 0 },
      u_pyramidHeight: { value: 0.01 },
      u_bassColor: { value: new THREE.Vector3(3.5, 0.2, 0.2) },
      u_baseScale: { value: 1.0 },
      u_point1_pos: { value: new THREE.Vector2(0.5, 0.5) },
      u_point1_color: { value: new THREE.Vector3(3.5, 0.2, 0.2) },
      u_point1_opacity: { value: 1 },
      u_point2_pos: { value: new THREE.Vector2(0.5, 0.5) },
      u_point2_color: { value: new THREE.Vector3(1, 0.84, 0) },
      u_point2_opacity: { value: 1 },
      u_point3_pos: { value: new THREE.Vector2(0.5, 0.5) },
      u_point3_color: { value: new THREE.Vector3(1, 1, 1) },
      u_point3_opacity: { value: 1 },
    }),
    [],
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (!isPlaying || !audioData) {
      return
    }

    const material = meshRef.current.material as THREE.ShaderMaterial
    timeRef.current += delta

    const bufferLength = audioData.length

    const totalSignal = Array.from(audioData).reduce((sum, val) => sum + val, 0)
    if (totalSignal < 10) {
      return
    }

    // Split audio into frequency bands
    const lowFreq = audioData.slice(0, Math.floor(bufferLength * 0.15))
    const midFreq = audioData.slice(Math.floor(bufferLength * 0.3), Math.floor(bufferLength * 0.6))
    const highFreq = audioData.slice(Math.floor(bufferLength * 0.7), bufferLength)

    const avgLow = lowFreq.reduce((sum, val) => sum + val, 0) / lowFreq.length
    const avgMid = midFreq.reduce((sum, val) => sum + val, 0) / midFreq.length
    const avgHigh = highFreq.reduce((sum, val) => sum + val, 0) / highFreq.length

    const normalizedLow = Math.min(avgLow / 128, 1)
    const normalizedMid = Math.min(avgMid / 128, 1)
    const normalizedHigh = Math.min(avgHigh / 128, 1)

    // Smooth audio reactivity
    smoothedLow.current += (normalizedLow - smoothedLow.current) * 0.15
    smoothedMid.current += (normalizedMid - smoothedMid.current) * 0.15
    smoothedHigh.current += (normalizedHigh - smoothedHigh.current) * 0.15

    const pyramidHeight = 0.01 + smoothedLow.current * 0.8
    material.uniforms.u_pyramidHeight.value = pyramidHeight

    const baseScale = 1.0 + smoothedLow.current * 2.0
    material.uniforms.u_baseScale.value = baseScale
    meshRef.current.scale.setScalar(baseScale)

    const bassColorR = 2.0 + smoothedLow.current * 0.3 // Reduced from 3.5
    const bassColorG = 0.1 + smoothedLow.current * 0.05 // Reduced green
    const bassColorB = 0.1 // Minimal blue
    material.uniforms.u_bassColor.value.set(bassColorR, bassColorG, bassColorB)

    const redJut = smoothedLow.current * 0.3
    material.uniforms.u_point1_pos.value.set(
      0.5 + Math.cos(timeRef.current * 0.5) * 0.15,
      0.5 + Math.sin(timeRef.current * 0.5) * 0.15,
    )
    material.uniforms.u_point1_color.value.copy(material.uniforms.u_bassColor.value)
    material.uniforms.u_point1_opacity.value = 0.7 + smoothedLow.current * 0.3

    const goldJut = smoothedMid.current * 0.25
    material.uniforms.u_point2_pos.value.set(
      0.5 + Math.cos(timeRef.current * 0.7 + Math.PI * 0.66) * 0.15,
      0.5 + Math.sin(timeRef.current * 0.7 + Math.PI * 0.66) * 0.15,
    )
    material.uniforms.u_point2_opacity.value = 0.7 + smoothedMid.current * 0.3

    const whiteJut = smoothedHigh.current * 0.2
    material.uniforms.u_point3_pos.value.set(
      0.5 + Math.cos(timeRef.current * 0.9 + Math.PI * 1.33) * 0.15,
      0.5 + Math.sin(timeRef.current * 0.9 + Math.PI * 1.33) * 0.15,
    )
    material.uniforms.u_point3_opacity.value = 0.7 + smoothedHigh.current * 0.3

    // Audio-reactive displacement and turbulence
    material.uniforms.u_displacement.value = (redJut + goldJut + whiteJut) * 2.0
    material.uniforms.u_turbulence.value = smoothedMid.current * 0.5
    material.uniforms.u_blur.value = smoothedLow.current * 0.3

    material.uniforms.u_time.value = timeRef.current

    // Move triangle towards camera based on audio
    const zPosition = 1.5 + (redJut + goldJut + whiteJut) * 3.0
    meshRef.current.position.z = zPosition
  })

  const vertexShader = `
    uniform float u_time;
    uniform float u_displacement;
    uniform float u_turbulence;
    uniform float u_pyramidHeight;
    uniform float u_baseScale;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vIsApex;
    
    // Simplex noise function for turbulent displacement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vUv = uv;
      vNormal = normal;
      
      vec3 pos = position;
      
      vIsApex = step(0.09, pos.z); // Apex has z > 0
      if (vIsApex > 0.5) {
        pos.z = u_pyramidHeight;
      }
      
      // Apply turbulent displacement
      float noise = snoise(vec3(pos.xy * 2.0, u_time * 0.5));
      float turbulentNoise = snoise(vec3(pos.xy * 5.0 + noise, u_time * 1.0));
      
      pos += normal * noise * u_displacement * 0.5;
      pos += normal * turbulentNoise * u_turbulence;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    uniform float u_time;
    uniform float u_blur;
    uniform vec3 u_bassColor;
    uniform vec2 u_point1_pos;
    uniform vec3 u_point1_color;
    uniform float u_point1_opacity;
    uniform vec2 u_point2_pos;
    uniform vec3 u_point2_color;
    uniform float u_point2_opacity;
    uniform vec2 u_point3_pos;
    uniform vec3 u_point3_color;
    uniform float u_point3_opacity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vIsApex;
    
    void main() {
      vec2 uv = vUv;
      
      // Apply blur effect
      vec2 blurredUv = uv + vec2(sin(u_time * 2.0), cos(u_time * 2.0)) * u_blur * 0.05;
      
      // Calculate distances from each point
      float dist1 = distance(blurredUv, u_point1_pos);
      float dist2 = distance(blurredUv, u_point2_pos);
      float dist3 = distance(blurredUv, u_point3_pos);
      
      // Calculate influence - gradients jut out from center
      float influence1 = 1.0 / (dist1 * dist1 * 3.0 + 0.1) * u_point1_opacity;
      float influence2 = 1.0 / (dist2 * dist2 * 3.0 + 0.1) * u_point2_opacity;
      float influence3 = 1.0 / (dist3 * dist3 * 3.0 + 0.1) * u_point3_opacity;
      
      float totalInfluence = influence1 + influence2 + influence3;
      
      // Blend colors based on influence
      vec3 color = (
        u_point1_color * influence1 +
        u_point2_color * influence2 +
        u_point3_color * influence3
      ) / totalInfluence;
      
      color *= 2.5;
      
      // Edge glow
      float edgeFactor = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
      color += edgeFactor * 0.3; // Reduced from 0.5
      
      gl_FragColor = vec4(color, 0.85);
    }
  `

  return (
    <mesh ref={meshRef} position={[0, 0, 1.5]} rotation={[0, 0, 0]} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
