"use client";
export const metadata = {
  title: "♒︎",
}
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function MailingListPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bgHue] = useState(183)
  const [bgSaturation] = useState(100)
  const [bgLightness, setBgLightness] = useState(68)
  const [animatedLightness, setAnimatedLightness] = useState(68)
  const [showWizard, setShowWizard] = useState(false)
  const [showWizardControls, setShowWizardControls] = useState(false)
  const [showWizardText, setShowWizardText] = useState(false)
  const [wizardClickCount, setWizardClickCount] = useState(0)
  const [speechText, setSpeechText] = useState("")
  const [birdColorSlider, setBirdColorSlider] = useState(0)
  const [birdPosition, setBirdPosition] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isFleeingFromMouse, setIsFleeingFromMouse] = useState(false)
  const [bgColor, setBgColor] = useState("gradient")
  const birdRef = useRef<HTMLDivElement>(null)

  const backgroundStyle =
    bgColor === "white"
      ? { background: "white" }
      : { background: `linear-gradient(to bottom, white, hsl(${bgHue}, ${bgSaturation}%, ${animatedLightness}%))` }

  const getBirdColor = (sliderValue: number) => {
    if (sliderValue <= 50) {
      const progress = sliderValue / 50
      return {
        hue: 210,
        saturation: progress * 100,
        lightness: 100 - progress * 30,
      }
    } else {
      const progress = (sliderValue - 50) / 50
      return {
        hue: 210 - progress * 180,
        saturation: 100,
        lightness: 70 - progress * 20,
      }
    }
  }

  const birdColor = getBirdColor(birdColorSlider)

  return (
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

      {/* ✅ Responsive circle for mobile */}
      <div className="bg-white rounded-full w-96 h-96 max-w-[90vw] max-h-[90vw] flex flex-col items-center justify-center neon-circle mb-8">
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
