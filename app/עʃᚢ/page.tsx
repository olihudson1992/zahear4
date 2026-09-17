"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

export default function MailingListPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bgHue] = useState(183)
  const [bgSaturation] = useState(100)
  const [animatedLightness, setAnimatedLightness] = useState(68)
  const [showWizard, setShowWizard] = useState(false)
  const [showWizardText, setShowWizardText] = useState(false)
  const [birdPosition, setBirdPosition] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isFleeingFromMouse, setIsFleeingFromMouse] = useState(false)
  const [bgColor, setBgColor] = useState("gradient")
  const birdRef = useRef<HTMLDivElement>(null)

  // AUDIO LOOP
  useEffect(() => {
    const audio = new Audio(
      "https://rangatracks.b-cdn.net/demos/sanga%20demos/ol%20-%20The%20Elephants%20Graveyard.wav",
    )
    audio.loop = true
    audio.volume = 0.3
    const playAudio = () => {
      audio.play().catch(() => {
        document.addEventListener("click", () => audio.play(), { once: true })
      })
    }
    playAudio()
    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  // BIRD RANDOM MOVEMENT
  useEffect(() => {
    const interval = setInterval(() => {
      setBirdPosition({
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // MOUSE TRACKING
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // BIRD FOLLOW MOUSE
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFleeingFromMouse) return
      const targetX = (mousePosition.x / window.innerWidth) * 100
      const targetY = (mousePosition.y / window.innerHeight) * 100
      setBirdPosition((prev) => ({
        x: prev.x + (targetX - prev.x) * 0.05,
        y: prev.y + (targetY - prev.y) * 0.05,
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [mousePosition, isFleeingFromMouse])

  // BIRD FLEE
  useEffect(() => {
    if (!birdRef.current) return
    const birdRect = birdRef.current.getBoundingClientRect()
    const birdCenterX = birdRect.left + birdRect.width / 2
    const birdCenterY = birdRect.top + birdRect.height / 2
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - birdCenterX, 2) + Math.pow(mousePosition.y - birdCenterY, 2),
    )
    if (distance < 30 && !isFleeingFromMouse) {
      setIsFleeingFromMouse(true)
      setBirdPosition({ x: Math.random() * 90 + 5, y: Math.random() * 80 + 10 })
      setTimeout(() => setIsFleeingFromMouse(false), 2000)
    }
  }, [mousePosition, isFleeingFromMouse])

  // BACKGROUND ANIMATION
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const cycleTime = 240000
      const progress = (elapsed % cycleTime) / cycleTime
      let lightness
      if (progress < 0.5) lightness = 68 + (95 - 68) * (progress * 2)
      else lightness = 95 - (95 - 68) * ((progress - 0.5) * 2)
      setAnimatedLightness(lightness)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // SHOW WIZARD AFTER 10 SECONDS
  useEffect(() => {
    const timer = setTimeout(() => setShowWizard(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleBirdClick = () => {
    setShowWizard(true)
    setBgColor(bgColor === "white" ? "gradient" : "white")
  }

  const handleWizardClick = () => {
    setShowWizardText(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setShowWizard(true)
    setShowWizardText(true)
    try {
      const response = await fetch("https://formspree.io/f/mldwowvy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
      } else console.error("Form submission failed")
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const backgroundStyle =
    bgColor === "white"
      ? { background: "white" }
      : { background: `linear-gradient(to bottom, white, hsl(${bgHue}, ${bgSaturation}%, ${animatedLightness}%))` }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 relative"
      style={{ ...backgroundStyle, paddingTop: "4.5rem" }}
    >
      <style>{`
        @keyframes qmark-bob {
          0%, 100% { transform: translateY(0) scale(1); }
          25%       { transform: translateY(-10px) scale(1.18); }
          55%       { transform: translateY(-4px) scale(1.07); }
          75%       { transform: translateY(-7px) scale(1.12); }
        }
        .qmark-bob { animation: qmark-bob 1.6s ease-in-out infinite; }
      `}</style>

      <div
        ref={birdRef}
        className="fixed text-2xl transition-all duration-1000 ease-out z-10 cursor-pointer hover:scale-110"
        style={{
          left: `${birdPosition.x}%`,
          top: `${birdPosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        onClick={handleBirdClick}
      >
        🕊️
      </div>

      <div className="bg-white rounded-full w-96 h-96 flex flex-col items-center justify-center neon-circle mb-8">
        {!isSubmitted ? (
          <>
            <h1 className="luminari-font text-3xl text-gray-800 mb-6 text-center">join us</h1>
            <form onSubmit={handleSubmit} className="w-64 space-y-6">
              <input
                type="email"
                name="email"
                placeholder="email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-center bg-white border border-gray-300 rounded-md focus:border-blue-400 focus:outline-none text-gray-800"
                required
              />
              <div className="flex justify-center">
                <button type="submit" className="text-4xl text-blue-600 hover:text-blue-800 transition-colors">
                  ♒
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-gray-800 luminari-font">Thank you for joining us!</p>
          </div>
        )}
      </div>

      <div className="mt-auto mb-8 flex flex-col items-center">
        {showWizard && (
          <div
            className="flex flex-col items-center cursor-pointer select-none"
            onClick={handleWizardClick}
          >
            <div
              className="qmark-bob text-4xl font-bold leading-none mb-1"
              style={{ color: "#f97316" }}
            >
              ?
            </div>
            <div className="text-4xl opacity-30 hover:opacity-60 transition-opacity mt-2">🧙‍♂️</div>
          </div>
        )}
      </div>

      {showWizard && showWizardText && (
        <div
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
          onClick={() => setShowWizardText(false)}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 px-10 py-5">
            <div className="luminari-font text-gray-800 text-center text-2xl">
              you&rsquo;ve been chosen, join us
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
