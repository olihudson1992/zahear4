"use client"

import { useEffect, useRef } from "react"

function YtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  )
}

function BcIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z"/>
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q22 16 24 12"/>
    </svg>
  )
}

const LINKS = [
  { href: "https://www.youtube.com/@Wyrdliverpool", label: "YouTube",  Icon: YtIcon,   ext: true  },
  { href: "https://wyrdliverpool.bandcamp.com",      label: "Bandcamp", Icon: BcIcon,   ext: true  },
  { href: "/rangas",                                  label: "Rangas",   Icon: WaveIcon, ext: false },
]

// 4 incommensurate frequencies per button/axis → quasi-random, never-repeating drift
function makeWaves(seed: number) {
  // Multiply golden-ratio-spaced base freqs by a seed-dependent factor
  const base = [0.043, 0.071, 0.113, 0.181]
  return {
    x: base.map((f, k) => ({
      freq: f * (1 + seed * 0.09) * Math.PI * 2,
      amp:  [24, 15, 8, 4][k],
      phase: seed * 2.618 + k * 1.618,
    })),
    y: base.map((f, k) => ({
      freq: f * (1 + seed * 0.07) * 1.272 * Math.PI * 2,
      amp:  [17, 11, 6, 3][k],
      phase: seed * 1.414 + k * 2.618,
    })),
  }
}

const WAVES = LINKS.map((_, i) => makeWaves(i))

export function SocialButtons() {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([])
  // Per-button click impulse: decaying x/y offset
  const impulse = useRef(LINKS.map(() => ({ x: 0, y: 0 })))

  const handleClick = (i: number) => {
    impulse.current[i].x += (Math.random() - 0.5) * 90
    impulse.current[i].y += (Math.random() - 0.5) * 90
  }

  useEffect(() => {
    let raf: number
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = (now - t0) / 1000

      wrapRefs.current.forEach((el, i) => {
        if (!el) return
        const w = WAVES[i]
        const imp = impulse.current[i]

        // Decay impulse
        imp.x *= 0.90
        imp.y *= 0.90

        let dx = imp.x
        let dy = imp.y
        for (const c of w.x) dx += Math.sin(t * c.freq + c.phase) * c.amp
        for (const c of w.y) dy += Math.cos(t * c.freq + c.phase) * c.amp

        // 3-D tilt follows displacement direction
        const ry = Math.max(-28, Math.min(28, dx * 0.45))
        const rx = Math.max(-18, Math.min(18, -dy * 0.30))

        el.style.transform = `translate(${dx}px,${dy}px) perspective(700px) rotateY(${ry}deg) rotateX(${rx}deg)`
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <style>{`
        .sb-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 16px; border-radius: 14px;
          text-decoration: none; color: #00d4ff;
          background: rgba(0,170,255,0.10);
          border: 1.5px solid rgba(0,210,255,0.40);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          font-size: 13px; font-weight: 600; letter-spacing: 0.05em; white-space: nowrap;
          box-shadow: 0 0 22px rgba(0,210,255,0.28), inset 0 0 10px rgba(0,210,255,0.06);
          font-family: system-ui,-apple-system,sans-serif;
          cursor: pointer;
          transition: transform 0.14s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, background 0.2s;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .sb-btn:hover {
          transform: scale(1.09);
          box-shadow: 0 0 46px rgba(0,220,255,0.70), inset 0 0 16px rgba(0,220,255,0.14);
          background: rgba(0,180,255,0.20);
        }
        .sb-btn:active {
          transform: scale(0.88) !important;
          box-shadow: 0 0 65px rgba(0,235,255,1), inset 0 0 26px rgba(0,235,255,0.30) !important;
          background: rgba(0,210,255,0.32) !important;
          transition-duration: 0.06s;
        }
        .sb-wrap { will-change: transform; }
        @media (max-width: 480px) {
          .sb-btn { font-size: 11px; padding: 8px 11px; gap: 5px; }
        }
      `}</style>

      <div style={{
        position: "fixed",
        bottom: "1.6rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "12px",
        zIndex: 50,
        pointerEvents: "none",
      }}>
        {LINKS.map(({ href, label, Icon, ext }, i) => (
          <div
            key={href}
            ref={el => { wrapRefs.current[i] = el }}
            className="sb-wrap"
            style={{ pointerEvents: "auto" }}
          >
            <a
              href={href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noopener noreferrer" : undefined}
              className="sb-btn"
              onClick={() => handleClick(i)}
            >
              <Icon />
              {label}
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
