"use client"

import { useState, useEffect, useRef } from "react"

interface Lightning {
  id: number
  angle: number
  progress: number
  color: "blue" | "green"
  freqPosition?: number // 0 = low (silver), 0.5 = mid (white), 1 = high (gold)
}

interface SmoothedValues {
  pitch: number
  lowFreq: number
  midFreq: number
  highFreq: number
  highFreqSlow: number
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function Page() {
  const [orbSize, setOrbSize] = useState(1) // Changed initial orbSize from 1 to 1
  const [glow1Scale, setGlow1Scale] = useState(8)
  const [glow1Opacity, setGlow1Opacity] = useState(30)
  const [glow1Blur, setGlow1Blur] = useState(120)
  const [glow2Scale, setGlow2Scale] = useState(5)
  const [glow2Opacity, setGlow2Opacity] = useState(40)
  const [glow2Blur, setGlow2Blur] = useState(80)
  const [glow3Scale, setGlow3Scale] = useState(3)
  const [glow3Opacity, setGlow3Opacity] = useState(60)
  const [glow3Blur, setGlow3Blur] = useState(48)
  const [glow4Scale, setGlow4Scale] = useState(1.5)
  const [glow4Opacity, setGlow4Opacity] = useState(80)
  const [glow4Blur, setGlow4Blur] = useState(24)
  const [floatDistance, setFloatDistance] = useState(10) // Changed initial value from 5 to 10
  const [floatDuration, setFloatDuration] = useState(20)

  const [trackActive, setTrackActive] = useState(false)
  const [audioValues, setAudioValues] = useState({
    pitch: 0,
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    highFreqSlow: 0, // Added slow-smoothed high frequency for scale modulation
  })

  const [bbLightActive, setBbLightActive] = useState(false)
  const [bbLightIntensity, setBbLightIntensity] = useState(0)

  const [midTriggerActive, setMidTriggerActive] = useState(false)
  const [lastMidValue, setLastMidValue] = useState(0)

  const [lightningBolts, setLightningBolts] = useState<Lightning[]>([])
  const [detectedFrequency, setDetectedFrequency] = useState(0)
  const lightningIdRef = useRef(0)
  const lastBbTriggerRef = useRef(0)
  const lastMidTriggerRef = useRef(0)

  const [blueOrbActive, setBlueOrbActive] = useState(false)
  const [blueOrbIntensity, setBlueOrbIntensity] = useState(0)

  const [started, setStarted] = useState(false)
  const [controlsCollapsed, setControlsCollapsed] = useState(true)
  const [firstBbDetected, setFirstBbDetected] = useState(false)
  const firstBbTimeRef = useRef<number | null>(null)

  const trackAudioRef = useRef<HTMLAudioElement | null>(null)
  const trackAnalyserRef = useRef<AnalyserNode | null>(null)
  const trackContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [animationActive, setAnimationActive] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const animationStartTimeRef = useRef<number | null>(null)
  const animationIntervalRef = useRef<number | null>(null)

  const [trackCurrentTime, setTrackCurrentTime] = useState(0)
  const [trackDuration, setTrackDuration] = useState(0)

  const [orbMaxSize, setOrbMaxSize] = useState(1100) // Changed from 11 to 1100
  const [glowMaxScale, setGlowMaxScale] = useState(65)
  const [animationDuration] = useState(3600) // Set animation duration to 60 minutes (3600 seconds)

  const totalSeconds = animationDuration
  const progress = Math.min(elapsedSeconds / totalSeconds, 1)

  const easedProgress = Math.pow(progress, 0.98) // Very close to linear for full hour duration

  const animatedOrbSize = animationActive ? 1 + (orbMaxSize - 1) * easedProgress : orbSize
  const animatedGlow1Scale = !firstBbDetected
    ? 0
    : animationActive
      ? 0 + (glowMaxScale - 0) * easedProgress
      : glow1Scale
  const animatedGlow2Scale = !firstBbDetected
    ? 0
    : animationActive
      ? 0 + (glowMaxScale - 0) * easedProgress
      : glow2Scale
  const animatedGlow3Scale = !firstBbDetected
    ? 0
    : animationActive
      ? 0 + (glowMaxScale - 0) * easedProgress
      : glow3Scale
  const animatedGlow4Scale = !firstBbDetected
    ? 0
    : animationActive
      ? 0 + (glowMaxScale - 0) * easedProgress
      : glow4Scale

  const animatedLightningLength = animationActive ? 1 + (800 - 1) * easedProgress : 800

  // const animatedFloatDistance = animationActive ? 10 + (100 - 10) * easedProgress : floatDistance

  const finalGlow1Scale = trackActive
    ? animatedGlow1Scale * (1 + audioValues.midFreq * 0.8 + audioValues.lowFreq * 0.6 + audioValues.highFreqSlow * 0.4)
    : animatedGlow1Scale
  const finalGlow2Scale = trackActive
    ? animatedGlow2Scale * (1 + audioValues.midFreq * 0.8 + audioValues.lowFreq * 0.5 + audioValues.highFreqSlow * 0.4)
    : animatedGlow2Scale
  const finalGlow3Scale = trackActive
    ? animatedGlow3Scale * (1 + audioValues.midFreq * 0.8 + audioValues.lowFreq * 0.4 + audioValues.highFreqSlow * 0.3)
    : animatedGlow3Scale
  const finalGlow4Scale = trackActive
    ? animatedGlow4Scale * (1 + audioValues.midFreq * 0.8 + audioValues.lowFreq * 0.3 + audioValues.highFreqSlow * 0.3)
    : animatedGlow4Scale

  const reactiveGlow1Blur = !firstBbDetected
    ? 0
    : trackActive
      ? glow1Blur + audioValues.pitch * 300 + audioValues.midFreq * 150 + audioValues.lowFreq * 100
      : glow1Blur
  const reactiveGlow2Blur = !firstBbDetected
    ? 0
    : trackActive
      ? glow2Blur + audioValues.pitch * 250 + audioValues.midFreq * 180 + audioValues.lowFreq * 120
      : glow2Blur
  const reactiveGlow3Blur = !firstBbDetected
    ? 0
    : trackActive
      ? glow3Blur + audioValues.pitch * 200 + audioValues.lowFreq * 150 + audioValues.midFreq * 100
      : glow3Blur
  const reactiveGlow4Blur = !firstBbDetected
    ? 0
    : trackActive
      ? glow4Blur + audioValues.lowFreq * 120 + audioValues.midFreq * 80
      : glow4Blur

  const reactiveGlow1Opacity = !firstBbDetected
    ? 0
    : trackActive
      ? Math.min(100, glow1Opacity + audioValues.highFreq * 80 + audioValues.lowFreq * 40)
      : glow1Opacity
  const reactiveGlow2Opacity = !firstBbDetected
    ? 0
    : trackActive
      ? Math.min(100, glow2Opacity + audioValues.highFreq * 100 + audioValues.lowFreq * 50)
      : glow2Opacity
  const reactiveGlow3Opacity = !firstBbDetected
    ? 0
    : trackActive
      ? Math.min(100, glow3Opacity + audioValues.pitch * 70 + audioValues.lowFreq * 45)
      : glow3Opacity
  const reactiveGlow4Opacity = !firstBbDetected
    ? 0
    : trackActive
      ? Math.min(100, glow4Opacity + audioValues.pitch * 80 + audioValues.lowFreq * 60)
      : glow4Opacity

  const startAnimation = () => {
    if (animationActive) return
    animationStartTimeRef.current = Date.now() - elapsedSeconds * 1000
    setAnimationActive(true)
  }

  const stopAnimation = () => {
    setAnimationActive(false)
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
  }

  const resetAnimation = () => {
    stopAnimation()
    setElapsedSeconds(0)
    animationStartTimeRef.current = null
  }

  const smoothedValuesRef = useRef<SmoothedValues>({
    pitch: 0,
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    highFreqSlow: 0,
  })

  useEffect(() => {
    if (animationActive) {
      animationIntervalRef.current = window.setInterval(() => {
        if (animationStartTimeRef.current) {
          const elapsed = (Date.now() - animationStartTimeRef.current) / 1000
          setElapsedSeconds(elapsed)

          if (elapsed >= totalSeconds) {
            stopAnimation()
            setElapsedSeconds(totalSeconds)
          }
        }
      }, 100) // Update every 100ms for smooth animation
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [animationActive])

  const detectPitch = (buffer: Float32Array, sampleRate: number): { normalized: number; frequency: number } => {
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    let best_offset = -1
    let best_correlation = 0
    let rms = 0

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)
    if (rms < 0.005) return { normalized: 0, frequency: 0 } // Lower threshold for more sensitivity

    let lastCorrelation = 1
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset])
      }
      correlation = 1 - correlation / MAX_SAMPLES
      if (correlation > 0.85 && correlation > lastCorrelation) {
        // Lowered threshold for more sensitivity
        const foundGoodCorrelation = correlation > best_correlation
        if (foundGoodCorrelation) {
          best_correlation = correlation
          best_offset = offset
        }
      }
      lastCorrelation = correlation
    }

    if (best_offset === -1) return { normalized: 0, frequency: 0 }
    const frequency = sampleRate / best_offset
    return {
      normalized: Math.min(1, (frequency - 80) / 400),
      frequency: frequency,
    }
  }

  const generateLightningPath = (angle: number, length: number): string => {
    const segments = 8 // Reduced segments from 20 to 8 for better performance
    let path = "M 0 0"

    for (let i = 1; i <= segments; i++) {
      const progress = i / segments
      const baseX = Math.cos(angle) * length * progress
      const baseY = Math.sin(angle) * length * progress

      const jitter = (Math.random() - 0.5) * 60
      const perpAngle = angle + Math.PI / 2
      const jitterX = Math.cos(perpAngle) * jitter
      const jitterY = Math.sin(perpAngle) * jitter

      const forwardJitter = (Math.random() - 0.5) * 20
      const forwardX = Math.cos(angle) * forwardJitter
      const forwardY = Math.sin(angle) * forwardJitter

      const x = baseX + jitterX + forwardX
      const y = baseY + jitterY + forwardY
      path += ` L ${x} ${y}`
    }

    return path
  }

  const triggerLightning = (color: "blue" | "green" = "blue", freqPosition?: number) => {
    const now = Date.now()

    if (color === "blue" && now - lastBbTriggerRef.current < 300) return
    if (color === "green" && now - lastMidTriggerRef.current < 250) return

    const angle = Math.random() * Math.PI * 2
    const newLightning: Lightning = {
      id: lightningIdRef.current++,
      angle: angle,
      progress: 0,
      color: color,
      freqPosition: freqPosition,
    }

    setLightningBolts((prev) => {
      const updated = [...prev, newLightning]
      return updated.slice(-5) // Keep only the last 5 bolts
    })

    if (color === "blue") {
      setBbLightActive(true)
      setBbLightIntensity(1)
      setBlueOrbActive(true)
      setBlueOrbIntensity(1)
    }

    setTimeout(() => {
      setLightningBolts((prev) => prev.filter((l) => l.id !== newLightning.id))
    }, 500)
  }

  useEffect(() => {
    if (!bbLightActive) return

    const fadeInterval = setInterval(() => {
      setBbLightIntensity((prev) => {
        const newIntensity = prev - 0.05
        if (newIntensity <= 0) {
          setBbLightActive(false)
          return 0
        }
        return newIntensity
      })
    }, 50)

    return () => clearInterval(fadeInterval)
  }, [bbLightActive])

  useEffect(() => {
    if (!blueOrbActive) return

    const fadeInterval = setInterval(() => {
      setBlueOrbIntensity((prev) => {
        const newIntensity = prev - 0.03
        if (newIntensity <= 0) {
          setBlueOrbActive(false)
          return 0
        }
        return newIntensity
      })
    }, 50)

    return () => clearInterval(fadeInterval)
  }, [blueOrbActive])

  const analyzeAudio = () => {
    const analyser = trackAnalyserRef.current
    if (!analyser) {
      return
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const timeDataArray = new Float32Array(analyser.fftSize)

    analyser.getByteFrequencyData(dataArray)
    analyser.getFloatTimeDomainData(timeDataArray)

    const lowEnd = Math.floor(bufferLength * 0.05)
    const midEnd = Math.floor(bufferLength * 0.6)
    const highEnd = bufferLength

    let lowSum = 0
    let midSum = 0
    let highSum = 0

    for (let i = 0; i < lowEnd; i++) lowSum += dataArray[i]
    for (let i = lowEnd; i < midEnd; i++) midSum += dataArray[i]
    for (let i = midEnd; i < highEnd; i++) highSum += dataArray[i]

    const lowFreq = (lowSum / lowEnd / 255) * 1.5
    const midFreq = (midSum / (midEnd - lowEnd) / 255) * 4.0
    const highFreq = (highSum / (highEnd - midEnd) / 255) * 1.5

    setLastMidValue(midFreq)

    let midBandPeakPosition = 0.5 // Default to center (white)
    if (midFreq > 0.2) {
      // Find the peak within the mid band
      let maxValue = 0
      let maxIndex = lowEnd
      for (let i = lowEnd; i < midEnd; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i]
          maxIndex = i
        }
      }
      // Normalize position within mid band (0 = lowEnd, 1 = midEnd)
      midBandPeakPosition = (maxIndex - lowEnd) / (midEnd - lowEnd)
    }

    const sampleRate = trackContextRef.current?.sampleRate || 44100
    const pitchData = detectPitch(timeDataArray, sampleRate)
    const pitch = pitchData.normalized
    const frequency = pitchData.frequency

    setDetectedFrequency(frequency)

    const BbFrequency = 466.16
    const tolerance = 25 // Increased tolerance for more sensitivity
    if (Math.abs(frequency - BbFrequency) < tolerance && frequency > 0) {
      triggerLightning("blue")

      if (!firstBbDetected && trackAudioRef.current) {
        setFirstBbDetected(true)
        const currentTime = trackAudioRef.current.currentTime
        firstBbTimeRef.current = currentTime
        console.log(`[v0] First B flat detected at ${formatTime(currentTime)} (${currentTime.toFixed(2)}s)`)
        startAnimation()
      }
    }

    if (midFreq > 0.2) {
      triggerLightning("green", midBandPeakPosition)
      setMidTriggerActive(true)
      setTimeout(() => setMidTriggerActive(false), 100)
    }

    const attackRate = 0.2
    const decayRate = 0.02
    const slowDecayRate = 0.005

    smoothedValuesRef.current.pitch +=
      (pitch - smoothedValuesRef.current.pitch) * (pitch > smoothedValuesRef.current.pitch ? attackRate : decayRate)
    smoothedValuesRef.current.lowFreq +=
      (lowFreq - smoothedValuesRef.current.lowFreq) *
      (lowFreq > smoothedValuesRef.current.lowFreq ? attackRate : decayRate)
    smoothedValuesRef.current.midFreq +=
      (midFreq - smoothedValuesRef.current.midFreq) *
      (midFreq > smoothedValuesRef.current.midFreq ? attackRate : decayRate)
    smoothedValuesRef.current.highFreq +=
      (highFreq - smoothedValuesRef.current.highFreq) *
      (highFreq > smoothedValuesRef.current.highFreq ? attackRate : decayRate)

    smoothedValuesRef.current.highFreqSlow +=
      (highFreq - smoothedValuesRef.current.highFreqSlow) *
      (highFreq > smoothedValuesRef.current.highFreqSlow ? 0.05 : slowDecayRate)

    setAudioValues({ ...smoothedValuesRef.current })

    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }

  const toggleTrack = async () => {
    if (trackActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (trackAudioRef.current) {
        trackAudioRef.current.pause()
        trackAudioRef.current.currentTime = 0
      }
      if (trackContextRef.current) {
        await trackContextRef.current.close()
        trackContextRef.current = null
      }
      trackAnalyserRef.current = null
      trackAudioRef.current = null
      setTrackActive(false)
    } else {
      try {
        const audio = new Audio("https://rangatracks.b-cdn.net/The%20Endless%20Night_Orchestral%20Hour.mp3")
        audio.crossOrigin = "anonymous"
        audio.loop = true

        await new Promise<void>((resolve, reject) => {
          audio.addEventListener("loadedmetadata", () => {
            audio.currentTime = 69 // Start at 1:09 (69 seconds)
            setTrackDuration(audio.duration)
            resolve()
          })
          audio.addEventListener("error", (e) => {
            reject(
              new Error(
                `Failed to load audio: ${audio.error?.message || "Unknown error"}. The file may not exist or CORS may be blocking access.`,
              ),
            )
          })
          audio.load()
        })

        audio.addEventListener("timeupdate", () => {
          setTrackCurrentTime(audio.currentTime)
        })

        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.8

        const gainNode = audioContext.createGain()
        gainNode.gain.value = 3.0

        const source = audioContext.createMediaElementSource(audio)
        source.connect(gainNode)
        gainNode.connect(analyser)
        analyser.connect(audioContext.destination)

        trackAudioRef.current = audio
        trackContextRef.current = audioContext
        trackAnalyserRef.current = analyser

        if (audioContext.state === "suspended") {
          await audioContext.resume()
        }

        await audio.play()
        console.log("[v0] Audio playing successfully")
        setTrackActive(true)
        analyzeAudio()
      } catch (err) {
        console.error("[v0] Error loading track:", err)
        alert(`Could not load audio track: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (trackAudioRef.current) {
      trackAudioRef.current.currentTime = value[0]
      setTrackCurrentTime(value[0])
    }
  }

  const getColorFromFreqPosition = (position: number): { primary: string; secondary: string; shadow: string } => {
    let r: number, g: number, b: number

    if (position < 0.3) {
      // Interpolate from silver (192, 192, 192) to white (255, 255, 255)
      const t = position / 0.3 // 0 to 1
      r = 192 + (255 - 192) * t
      g = 192 + (255 - 192) * t
      b = 192 + (255 - 192) * t
    } else {
      // Interpolate from white (255, 255, 255) to gold (218, 165, 32)
      const t = (position - 0.3) / 0.7 // 0 to 1
      r = 255 + (218 - 255) * t
      g = 255 + (165 - 255) * t
      b = 255 + (32 - 255) * t
    }

    const primary = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    const secondary = `rgb(${Math.min(255, Math.round(r + 50))}, ${Math.min(255, Math.round(g + 50))}, ${Math.min(255, Math.round(b + 50))})`
    const shadow = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.8)`

    return { primary, secondary, shadow }
  }

  const handleStart = () => {
    setStarted(true)
    toggleTrack()
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <img
          src="/images/f04c8ffa.png"
          alt="Logo"
          className="absolute bottom-8 left-8 w-24 h-24 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleStart}
        />

        <div className="text-white/50 text-3xl font-luminari animate-pulse cursor-pointer" onClick={handleStart}>
          click to enter
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-luminari text-white/40 text-xs space-y-1">
          <div>The Song Inside</div>
          <div>Chapter One</div>
          <div>The Endless Night</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `float ${floatDuration}s ease-in-out infinite`,
          transform: `scale(var(--float-progress, 1))`,
        }}
      >
        {firstBbDetected && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: `${animatedOrbSize * finalGlow1Scale}px`,
                height: `${animatedOrbSize * finalGlow1Scale}px`,
                backgroundColor: `rgba(255, 255, 255, ${reactiveGlow1Opacity / 100})`,
                filter: `blur(${reactiveGlow1Blur}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <div
              className="absolute rounded-full"
              style={{
                width: `${animatedOrbSize * finalGlow2Scale}px`,
                height: `${animatedOrbSize * finalGlow2Scale}px`,
                backgroundColor: `rgba(255, 255, 255, ${reactiveGlow2Opacity / 100})`,
                filter: `blur(${reactiveGlow2Blur}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <div
              className="absolute rounded-full"
              style={{
                width: `${animatedOrbSize * finalGlow3Scale}px`,
                height: `${animatedOrbSize * finalGlow3Scale}px`,
                backgroundColor: `rgba(255, 255, 255, ${reactiveGlow3Opacity / 100})`,
                filter: `blur(${reactiveGlow3Blur}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <div
              className="absolute rounded-full"
              style={{
                width: `${animatedOrbSize * finalGlow4Scale}px`,
                height: `${animatedOrbSize * finalGlow4Scale}px`,
                backgroundColor: `rgba(255, 255, 255, ${reactiveGlow4Opacity / 100})`,
                filter: `blur(${reactiveGlow4Blur}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </>
        )}

        {bbLightActive && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${animatedOrbSize * 20}px`,
              height: `${animatedOrbSize * 20}px`,
              backgroundColor: `rgba(59, 130, 246, ${bbLightIntensity * 0.6})`,
              filter: `blur(${60 * bbLightIntensity}px)`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              transition: "opacity 0.1s ease-out",
            }}
          />
        )}

        {blueOrbActive && firstBbDetected && (
          <>
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${animatedOrbSize * finalGlow1Scale * 0.6}px`,
                height: `${animatedOrbSize * finalGlow1Scale * 0.6}px`,
                backgroundColor: `rgba(59, 130, 246, ${(reactiveGlow1Opacity / 100) * blueOrbIntensity * 0.7})`,
                filter: `blur(${reactiveGlow1Blur * 0.8}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${animatedOrbSize * finalGlow2Scale * 0.5}px`,
                height: `${animatedOrbSize * finalGlow2Scale * 0.5}px`,
                backgroundColor: `rgba(96, 165, 250, ${(reactiveGlow2Opacity / 100) * blueOrbIntensity * 0.8})`,
                filter: `blur(${reactiveGlow2Blur * 0.7}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${animatedOrbSize * finalGlow3Scale * 0.4}px`,
                height: `${animatedOrbSize * finalGlow3Scale * 0.4}px`,
                backgroundColor: `rgba(147, 197, 253, ${(reactiveGlow3Opacity / 100) * blueOrbIntensity * 0.9})`,
                filter: `blur(${reactiveGlow3Blur * 0.6}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${animatedOrbSize * 1.2}px`,
                height: `${animatedOrbSize * 1.2}px`,
                backgroundColor: `rgba(59, 130, 246, ${blueOrbIntensity})`,
                filter: `blur(${reactiveGlow4Blur * 0.3}px)`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 ${30 * blueOrbIntensity}px ${10 * blueOrbIntensity}px rgba(59, 130, 246, ${
                  blueOrbIntensity * 0.8
                })`,
              }}
            />
          </>
        )}

        <div
          className="relative rounded-full bg-white shadow-[0_0_80px_30px_rgba(255,255,255,0.8)]"
          style={{
            width: `${animatedOrbSize}px`,
            height: `${animatedOrbSize}px`,
          }}
        />

        {lightningBolts.map((bolt) => {
          const maxLength = Math.min(animatedLightningLength, animatedOrbSize * 1.5) // Cap lightning length at orb size to never exceed it
          const currentLength = maxLength * bolt.progress
          const inheritedBlur = (reactiveGlow1Blur + reactiveGlow2Blur + reactiveGlow3Blur + reactiveGlow4Blur) / 4

          const colors = {
            blue: {
              primary: "rgb(59, 130, 246)",
              secondary: "rgb(147, 197, 253)",
              shadow: "rgba(59, 130, 246, 0.8)",
            },
            green:
              bolt.freqPosition !== undefined
                ? getColorFromFreqPosition(bolt.freqPosition)
                : {
                    primary: "rgb(218, 165, 32)",
                    secondary: "rgb(255, 215, 0)",
                    shadow: "rgba(218, 165, 32, 0.8)",
                  },
          }

          const colorScheme = colors[bolt.color]

          return (
            <svg
              key={bolt.id}
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                width: `${maxLength * 2}px`,
                height: `${maxLength * 2}px`,
                transform: "translate(-50%, -50%)",
                filter: `blur(${Math.min(inheritedBlur / 15, 8)}px) drop-shadow(0 0 ${inheritedBlur / 10}px ${colorScheme.shadow})`,
              }}
            >
              <g transform={`translate(${maxLength}, ${maxLength})`}>
                <path
                  d={generateLightningPath(bolt.angle, currentLength)}
                  stroke={colorScheme.primary}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={(1 - bolt.progress * 0.5) * 0.3}
                />
                <path
                  d={generateLightningPath(bolt.angle, currentLength)}
                  stroke={colorScheme.secondary}
                  strokeWidth="0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={(1 - bolt.progress * 0.3) * 0.4}
                />
              </g>
            </svg>
          )
        })}
      </div>
    </div>
  )
}
