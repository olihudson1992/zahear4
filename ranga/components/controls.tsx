"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface ControlsProps {
  audioBuffer: AudioBuffer | null
  setReverbEnabled: (enabled: boolean) => void
  setEchoEnabled: (enabled: boolean) => void
  setDistortionEnabled: (enabled: boolean) => void
  reverbEnabled: boolean
  echoEnabled: boolean
  distortionEnabled: boolean
  sourceNodeRef: React.MutableRefObject<AudioBufferSourceNode | null>
  audioContextRef: React.MutableRefObject<AudioContext | null>
}

const Controls: React.FC<ControlsProps> = ({
  audioBuffer,
  setReverbEnabled,
  setEchoEnabled,
  setDistortionEnabled,
  reverbEnabled,
  echoEnabled,
  distortionEnabled,
  sourceNodeRef,
  audioContextRef,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    if (audioContextRef.current) {
      setAudioContext(audioContextRef.current)
    }
  }, [audioContextRef])

  const initializeAudio = async () => {
    try {
      const newAudioContext = new AudioContext()
      setAudioContext(newAudioContext)
      audioContextRef.current = newAudioContext

      if (audioBuffer) {
        const sourceNode = newAudioContext.createBufferSource()
        sourceNode.buffer = audioBuffer
        sourceNode.connect(newAudioContext.destination)
        sourceNodeRef.current = sourceNode
      }
      setIsPlaying(true)
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }

  const handlePlayPause = async () => {
    try {
      if (!audioContext) {
        await initializeAudio()
        return
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      if (isPlaying) {
        setIsPlaying(false)
      } else {
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error handling play/pause:", error)
    }
  }

  useEffect(() => {
    if (audioContext && sourceNodeRef.current) {
      if (isPlaying) {
        sourceNodeRef.current = audioContext.createBufferSource()
        sourceNodeRef.current.buffer = audioBuffer
        sourceNodeRef.current.connect(audioContext.destination)
        sourceNodeRef.current.start(0)
        sourceNodeRef.current.onended = () => setIsPlaying(false)
      } else {
        if (audioContext.state === "running") {
          sourceNodeRef.current.stop()
        }
      }
    }
  }, [isPlaying, audioBuffer, audioContext, sourceNodeRef])

  return (
    <div className="flex space-x-4">
      <button
        onClick={handlePlayPause}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        onClick={() => setReverbEnabled(!reverbEnabled)}
        className={`px-4 py-2 rounded transition-colors ${
          reverbEnabled ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300"
        }`}
      >
        Reverb
      </button>

      <button
        onClick={() => setEchoEnabled(!echoEnabled)}
        className={`px-4 py-2 rounded transition-colors ${
          echoEnabled ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
        }`}
      >
        Echo
      </button>

      <button
        onClick={() => setDistortionEnabled(!distortionEnabled)}
        className={`px-4 py-2 rounded transition-colors ${
          distortionEnabled ? "bg-red-600 text-white" : "bg-gray-600 text-gray-300"
        }`}
      >
        Distortion
      </button>
    </div>
  )
}

export default Controls
