"use client"

import { useEffect, useRef } from "react"

type Node = {
  baseX: number
  baseY: number
  radius: number
  speed: number
  phase: number
  orbit: number
  color: string
}

// Converts any colour darker than minL (HSL lightness) to the same hue/sat at minL.
// Keeps the colour character but prevents dark blobs on the white canvas.
function ensureLight(hex: string, minL = 0.5): string {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let hue = 0, sat = 0
  const lit = (max + min) / 2
  if (max !== min) {
    const d = max - min
    sat = lit > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) hue = ((b - r) / d + 2) / 6
    else hue = ((r - g) / d + 4) / 6
  }
  if (lit >= minL) return hex
  const q = minL < 0.5 ? minL * (1 + sat) : minL + sat - minL * sat
  const p = 2 * minL - q
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const nr = Math.round(hue2rgb(hue + 1 / 3) * 255)
  const ng = Math.round(hue2rgb(hue) * 255)
  const nb = Math.round(hue2rgb(hue - 1 / 3) * 255)
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`
}

function buildNodes(colors: string[]): Node[] {
  const seeds = [
    { x: 0.2, y: 0.25, r: 0.55, s: 0.13, o: 0.1 },
    { x: 0.78, y: 0.18, r: 0.42, s: 0.17, o: 0.13 },
    { x: 0.85, y: 0.7, r: 0.6, s: 0.11, o: 0.09 },
    { x: 0.32, y: 0.78, r: 0.5, s: 0.19, o: 0.14 },
    { x: 0.55, y: 0.45, r: 0.38, s: 0.23, o: 0.16 },
    { x: 0.1, y: 0.6, r: 0.33, s: 0.15, o: 0.12 },
    { x: 0.62, y: 0.92, r: 0.45, s: 0.21, o: 0.11 },
  ]
  return seeds.map((p, i) => ({
    baseX: p.x,
    baseY: p.y,
    radius: p.r,
    speed: p.s,
    phase: i * 1.7,
    orbit: p.o,
    color: ensureLight(colors[i % colors.length]),
  }))
}

export function GradientField({
  colors,
  energy,
}: {
  colors: string[]
  base: string
  energy: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const nodesRef = useRef<Node[]>(buildNodes(colors))
  const energyRef = useRef(energy)
  const colorsRef = useRef(colors)

  useEffect(() => { energyRef.current = energy }, [energy])
  useEffect(() => {
    nodesRef.current = buildNodes(colors)
    colorsRef.current = colors
  }, [colors])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const W = 220
    const H = 320
    canvas.width = W
    canvas.height = H

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    let raf = 0
    let t = 0
    let last = performance.now()
    let running = true

    const onVisibility = () => {
      running = document.visibilityState === "visible"
      if (running) {
        last = performance.now()
        raf = requestAnimationFrame(draw)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    function draw(now: number) {
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const e = energyRef.current
      t += dt * (0.08 + e * 0.7) * (prefersReduced ? 0.25 : 1)

      // Always white background — colour blobs fade to white at edges
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, W, H)

      // Multiply so colours tint the white canvas rather than adding toward white
      ctx.globalCompositeOperation = "multiply"

      const pulse = 0.88 + 0.32 * Math.sin(t * 1.6) * e
      const nodes = nodesRef.current

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const wobble = n.orbit * (0.25 + e * 1.4)
        const x = (n.baseX + Math.cos(t * n.speed * 6.28 + n.phase) * wobble) * W
        const y = (n.baseY + Math.sin(t * n.speed * 6.28 + n.phase * 1.3) * wobble) * H
        const r = n.radius * Math.max(W, H) * (0.55 + e * 0.75 * pulse)

        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        // Colour at centre → white (transparent) at edge = colour-to-white gradient
        g.addColorStop(0, hexToRgba(n.color, 0.72))
        g.addColorStop(0.5, hexToRgba(n.color, 0.28))
        g.addColorStop(1, hexToRgba(n.color, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{
        filter: "blur(52px) saturate(1.3)",
        transform: "scale(1.25)",
      }}
    />
  )
}

function hexToRgba(hex: string, alpha: number) {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
