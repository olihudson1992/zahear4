"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Head from "next/head"


export default function MailingListPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bgHue] = useState(183) // Default blue hue
  const [bgSaturation] = useState(100) // Added saturation control
  const [bgLightness, setBgLightness] = useState(68) // Added lightness control
  const [animatedLightness, setAnimatedLightness] = useState(68)
  const [showWizard, setShowWizard] = useState(false)
  const [showWizardControls, setShowWizardControls] = useState(false)
  const [showWizardText, setShowWizardText] = useState(false)
  const [wizardClickCount, setWizardClickCount] = useState(0)
  const [speechText, setSpeechText] = useState("")
  const [birdColorSlider, setBirdColorSlider] = useState(0) // 0 = white, 50 = blue, 100 = orange
  const [birdPosition, setBirdPosition] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isFleeingFromMouse, setIsFleeingFromMouse] = useState(false)
  const [bgColor, setBgColor] = useState("gradient") // Added background color state
  const birdRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const animateBird = () => {
      setBirdPosition({
        x: Math.random() * 90 + 5, // Keep bird within 5-95% of screen
        y: Math.random() * 80 + 10, // Keep bird within 10-90% of screen
      })
    }

    const interval = setInterval(animateBird, 3000) // Move every 3 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const animateBird = () => {
      if (isFleeingFromMouse) return

      const targetX = (mousePosition.x / window.innerWidth) * 100
      const targetY = (mousePosition.y / window.innerHeight) * 100

      // Follow mouse but with some offset and smoothing
      setBirdPosition((prev) => ({
        x: prev.x + (targetX - prev.x) * 0.05, // Slower, more graceful
        y: prev.y + (targetY - prev.y) * 0.05,
      }))
    }

    const interval = setInterval(animateBird, 50) // More frequent updates for smoothness
    return () => clearInterval(interval)
  }, [mousePosition, isFleeingFromMouse])

  useEffect(() => {
    if (!birdRef.current) return

    const birdRect = birdRef.current.getBoundingClientRect()
    const birdCenterX = birdRect.left + birdRect.width / 2
    const birdCenterY = birdRect.top + birdRect.height / 2

    const distance = Math.sqrt(Math.pow(mousePosition.x - birdCenterX, 2) + Math.pow(mousePosition.y - birdCenterY, 2))

    if (distance < 30 && !isFleeingFromMouse) {
      setIsFleeingFromMouse(true)
      // Flee to random position
      setBirdPosition({
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
      })

      setTimeout(() => setIsFleeingFromMouse(false), 2000)
    }
  }, [mousePosition, isFleeingFromMouse])

  useEffect(() => {
    const startTime = Date.now()

    const animateLightness = () => {
      const elapsed = Date.now() - startTime
      const cycleTime = 240000 // 4 minutes total cycle (2 min each way)
      const progress = (elapsed % cycleTime) / cycleTime

      let lightness
      if (progress < 0.5) {
        // First 2 minutes: 68% to 95%
        lightness = 68 + (95 - 68) * (progress * 2)
      } else {
        // Next 2 minutes: 95% to 68%
        lightness = 95 - (95 - 68) * ((progress - 0.5) * 2)
      }

      setAnimatedLightness(lightness)
    }

    const interval = setInterval(animateLightness, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWizard(true)
    }, 120000) // 2 minutes

    return () => clearTimeout(timer)
  }, [])


  const handleBirdClick = () => {
    setShowWizard(true)
    setBgColor(bgColor === "white" ? "gradient" : "white")
  }

  const handleWizardClick = () => {
    const newClickCount = wizardClickCount + 1
    setWizardClickCount(newClickCount)

    if (newClickCount === 1 || (showWizard && wizardClickCount === 0)) {
      setSpeechText("Welcome!")
      setShowWizardText(true)
      setTimeout(() => setShowWizardText(false), 3000)
    } else if (newClickCount === 2) {
      setSpeechText(
        "You found me!\n\nWould you like to download this lovely song?\n\nJust click me again and the download will begin!",
      )
      setShowWizardText(true)
    } else if (newClickCount >= 3) {
      setShowWizardText(false)
      setSpeechText("Downloading...")
      setShowWizardText(true)
      setShowWizardControls(!showWizardControls)

      const downloadAudio = async () => {
        try {
          const response = await fetch(
            "https://rangatracks.b-cdn.net/demos/sanga%20demos/ol%20-%20The%20Elephants%20Graveyard.wav",
          )
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = "The Elephants Graveyard.wav"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.log("[v0] Download failed due to CORS/CSP restrictions:", error)
          // Fallback: open in new tab
          window.open(
            "https://rangatracks.b-cdn.net/demos/sanga%20demos/ol%20-%20The%20Elephants%20Graveyard.wav",
            "_blank",
          )
        }
      }

      downloadAudio()
      setTimeout(() => setShowWizardText(false), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setShowWizard(true)
    setWizardClickCount(1)
    setSpeechText("Welcome!")
    setShowWizardText(true)
    setTimeout(() => setShowWizardText(false), 3000)

    try {
      const response = await fetch("https://formspree.io/f/mldwowvy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
      } else {
        console.error("Form submission failed")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const backgroundStyle =
    bgColor === "white"
      ? { background: "white" }
      : { background: `linear-gradient(to bottom, white, hsl(${bgHue}, ${bgSaturation}%, ${animatedLightness}%))` }

  const getBirdColor = (sliderValue: number) => {
    if (sliderValue <= 50) {
      // White to bright blue (0-50)
      const progress = sliderValue / 50
      return {
        hue: 210, // Blue hue
        saturation: progress * 100, // 0% to 100%
        lightness: 100 - progress * 30, // 100% to 70%
      }
    } else {
      // Bright blue to orange (50-100)
      const progress = (sliderValue - 50) / 50
      return {
        hue: 210 - progress * 180, // Blue (210) to orange (30)
        saturation: 100, // Keep at 100%
        lightness: 70 - progress * 20, // 70% to 50%
      }
    }
  }

  const birdColor = getBirdColor(birdColorSlider)

  return (
    <>
    <Head>
      <title>♒︎</title>
    </Head>
      
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" style={backgroundStyle}>
      {showWizardControls && (
        <div className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-lg p-3">
          <input
            type="range"
            min="0"
            max="100"
            value={birdColorSlider}
            onChange={(e) => setBirdColorSlider(Number(e.target.value))}
            className="w-32"
          />
        </div>
      )}

      <div
        ref={birdRef}
        className="fixed text-2xl transition-all duration-1000 ease-out z-10 cursor-pointer hover:scale-110"
        style={{
          left: `${birdPosition.x}%`,
          top: `${birdPosition.y}%`,
          transform: "translate(-50%, -50%)",
          filter: `hue-rotate(${birdColor.hue}deg) saturate(${birdColor.saturation / 100 + 1}) brightness(${birdColor.lightness / 100})`,
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
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-center bg-white border border-gray-300 rounded-md focus:border-blue-400 focus:outline-none text-gray-800"
                  required
                />
              </div>
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

      <div className="mt-auto mb-8 relative">
        <Image
          src="public/images/song-inside-logo.png"
          alt="The Song Inside Logo"
          width={120}
          height={120}
          className="opacity-70"
          style={{ mixBlendMode: "multiply" }}
        />

        {showWizard && (
          <div
            className={`text-4xl cursor-pointer transition-all duration-300 opacity-30 hover:opacity-60 mt-4 text-center ${
              wizardClickCount > 0 ? "scale-125" : "hover:scale-110"
            }`}
            onClick={handleWizardClick}
          >
            🧙‍♂️
          </div>
        )}
      </div>

      {showWizard && showWizardText && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          {speechText === "Welcome!" ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 px-8 py-4 pointer-events-auto">
              <div className="luminari-font text-gray-800 text-center text-2xl">{speechText}</div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-8 w-[90vw] max-w-6xl pointer-events-auto">
              <div className="luminari-font text-gray-800 text-center text-xl leading-relaxed whitespace-pre-line">
                {speechText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
