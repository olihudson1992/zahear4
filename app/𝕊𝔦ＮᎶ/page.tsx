"use client"

import { useEffect, useRef, useState } from "react"

const AUDIO_URL = "https://rangatracks.b-cdn.net/first.mp3"

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardLeaving, setWizardLeaving] = useState(false)
  const wizardTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 256

    audioElementRef.current = new Audio(AUDIO_URL)
    audioElementRef.current.crossOrigin = "anonymous"
    audioElementRef.current.loop = true

    const source = audioContextRef.current.createMediaElementSource(audioElementRef.current)
    source.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)

    const attemptAutoplay = async () => {
      try {
        if (audioContextRef.current && audioElementRef.current) {
          await audioContextRef.current.resume()
          await audioElementRef.current.play()
          setIsPlaying(true)
          animate()
          setTimeout(() => {
            setShowWizard(true)
            wizardTimerRef.current = setTimeout(() => {
              hideWizard()
            }, 20000)
          }, 60000)
        }
      } catch (error) {
        console.log("[v0] Autoplay blocked, user interaction required")
        setTimeout(() => {
          setShowWizard(true)
          wizardTimerRef.current = setTimeout(() => {
            hideWizard()
          }, 20000)
        }, 15000)
      }
    }

    attemptAutoplay()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (wizardTimerRef.current) {
        clearTimeout(wizardTimerRef.current)
      }
    }
  }, [])

  const hideWizard = () => {
    setWizardLeaving(true)
    setTimeout(() => {
      setShowWizard(false)
      setWizardLeaving(false)
    }, 1000)
  }

  const animate = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      const lowFreqEnd = Math.floor(bufferLength * 0.3)
      const midFreqEnd = Math.floor(bufferLength * 0.6)
      const highFreqStart = Math.floor(bufferLength * 0.7)

      let lowFreqSum = 0
      let midFreqSum = 0
      let highFreqSum = 0

      for (let i = 0; i < lowFreqEnd; i++) {
        lowFreqSum += dataArray[i]
      }
      for (let i = lowFreqEnd; i < midFreqEnd; i++) {
        midFreqSum += dataArray[i]
      }
      for (let i = highFreqStart; i < bufferLength; i++) {
        highFreqSum += dataArray[i]
      }

      const lowFreqAvg = lowFreqSum / lowFreqEnd / 255
      const midFreqAvg = midFreqSum / (midFreqEnd - lowFreqEnd) / 255
      const highFreqAvg = highFreqSum / (bufferLength - highFreqStart) / 255

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5,
      )

      const blueIntensity = Math.floor(lowFreqAvg * 255)
      const pinkIntensity = Math.floor(midFreqAvg * 255)
      const whiteIntensity = Math.floor(highFreqAvg * 255)

      gradient.addColorStop(
        0,
        `rgb(${blueIntensity * 0.5 + pinkIntensity * 0.3}, ${blueIntensity * 0.7}, ${blueIntensity + pinkIntensity * 0.2})`,
      )
      gradient.addColorStop(
        0.5,
        `rgb(${pinkIntensity + blueIntensity * 0.3}, ${pinkIntensity * 0.5 + blueIntensity * 0.3}, ${pinkIntensity * 0.8 + blueIntensity * 0.5})`,
      )
      gradient.addColorStop(1, `rgb(${whiteIntensity}, ${whiteIntensity}, ${whiteIntensity})`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    draw()
  }

  const handleCanvasClick = () => {
    if (!audioElementRef.current || !audioContextRef.current) return

    if (showWizard || wizardLeaving) {
      if (wizardTimerRef.current) {
        clearTimeout(wizardTimerRef.current)
      }
      hideWizard()
    }

    if (!isPlaying) {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }
      audioElementRef.current.play()
      setIsPlaying(true)
      animate()
      setTimeout(() => {
        setShowWizard(true)
        wizardTimerRef.current = setTimeout(() => {
          hideWizard()
        }, 20000)
      }, 60000)
    } else {
      fetch(AUDIO_URL)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = "first.mp3"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => console.error("[v0] Download failed:", error))
    }
  }

  const handleResize = () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }

  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-pointer" />

      {showWizard && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
            wizardLeaving ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          style={{
            animation: wizardLeaving ? "none" : "sparkle 0.6s ease-out",
          }}
        >
          <div className="relative flex flex-col items-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl max-w-md mb-2">
              <p className="text-black font-luminari text-lg text-center">
                Azar! Just click anywhere and the track will download!
              </p>
            </div>
            <div className="text-5xl">🧙🏻‍♂️</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
            filter: brightness(2);
          }
          50% {
            filter: brightness(1.5);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  )
}
