"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const NO_PLAY_MS = 60_000   // 1 min: never pressed play
const IDLE_MS    = 120_000  // 2 min: played before but now inactive

export function WizardPrompt({ isPlaying }: { isPlaying: boolean }) {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false
    try { return !!sessionStorage.getItem("wizard-gone") } catch { return false }
  })
  const hasPlayedRef = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const delay = hasPlayedRef.current ? IDLE_MS : NO_PLAY_MS
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [])

  // Hide while playing; restart timer when paused/stopped
  useEffect(() => {
    if (isPlaying) {
      hasPlayedRef.current = true
      setVisible(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else if (!dismissed) {
      schedule()
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isPlaying, dismissed, schedule])

  // Any user activity resets the inactivity timer
  useEffect(() => {
    if (dismissed) return
    const reset = () => { if (!isPlaying) schedule() }
    window.addEventListener("mousemove",  reset, { passive: true })
    window.addEventListener("keydown",    reset, { passive: true })
    window.addEventListener("touchstart", reset, { passive: true })
    return () => {
      window.removeEventListener("mousemove",  reset)
      window.removeEventListener("keydown",    reset)
      window.removeEventListener("touchstart", reset)
    }
  }, [dismissed, isPlaying, schedule])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
    try { sessionStorage.setItem("wizard-gone", "1") } catch {}
  }

  if (!visible || dismissed) return null

  return (
    <>
      <style>{`
        @keyframes wizard-pop {
          0%   { opacity: 0; transform: translateY(80px) scale(0.5) rotate(-20deg); }
          55%  { opacity: 1; transform: translateY(-10px) scale(1.09) rotate(5deg); }
          75%  { transform: translateY(5px) scale(0.97) rotate(-2deg); }
          90%  { transform: translateY(-3px) scale(1.02) rotate(1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        .wizard-pop {
          animation: wizard-pop 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <div
        className="wizard-pop fixed left-3 z-45 flex flex-col items-start gap-2"
        style={{ bottom: 72 }}
      >
        {expanded && (
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 16,
              padding: "12px 14px",
              maxWidth: 272,
              fontSize: 13,
              lineHeight: 1.65,
              color: "#0a0a0e",
              boxShadow: "0 4px 28px rgba(0,0,0,0.13)",
            }}
          >
            yes oli is quite confusing, i think he does it on purpose but if you
            give a little it&apos;s fun. these floating balls are portals to his
            music. he&apos;s curated 12 albums of tracks to send to people, he
            doesn&apos;t really know why he&apos;s doing it, nor what he will do
            with it, but it&apos;s what he wants to do.. just click an orb and
            then you&apos;ll find more orbs and the music will play. if you like
            any of the tracks big it up in the chat window :)
          </div>
        )}

        <button
          onClick={() => { if (expanded) dismiss(); else setExpanded(true) }}
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 24,
            padding: "8px 14px",
            fontSize: 13,
            color: "#0a0a0e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
            fontFamily: "inherit",
            userSelect: "none",
          } as React.CSSProperties}
        >
          <span style={{ fontSize: 22 }}>🧙</span>
          <span style={{ color: "rgba(0,0,0,0.65)" }}>
            {expanded ? "got it! ✨" : "confused?"}
          </span>
        </button>
      </div>
    </>
  )
}
