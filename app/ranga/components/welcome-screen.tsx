"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onEnterCave: () => void
  onMusicOnly: () => void
  skipAnimation?: boolean
}

export default function WelcomeScreen({ onEnterCave, onMusicOnly, skipAnimation = false }: WelcomeScreenProps) {
  const [animationPhase, setAnimationPhase] = useState(skipAnimation ? 6 : 0)
  const [messages, setMessages] = useState<Array<{ id: string; text: string; timestamp: number }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [showMessageBoard, setShowMessageBoard] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (skipAnimation) {
      setAnimationPhase(6)
      return
    }

    const timeouts: NodeJS.Timeout[] = []

    // Sped up timing (reduced by 25%)
    // Phase 0: White page (1.5 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(1), 1500))

    // Phase 1: "Lo!" appears and holds (1.5 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(2), 3000))

    // Phase 2: 0.2 second gap (blank)
    timeouts.push(setTimeout(() => setAnimationPhase(3), 3200))

    // Phase 3: "Behold!" appears and holds (2.5 seconds instead of 1.5)
    timeouts.push(setTimeout(() => setAnimationPhase(4), 5500))

    // Phase 4: "Ranga?" appears and holds (1.5 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(5), 7000))

    // Phase 5: "So here..." starts fading in (over 2.2 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(6), 9200))

    // Phase 6: Rest of page appears

    // Phase 7: Buttons appear 3 seconds after "So here..." (add new phase)
    timeouts.push(setTimeout(() => setAnimationPhase(7), 12200))

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [skipAnimation])

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("ranga-messages")
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error("Error loading messages:", e)
      }
    }
  }, [])

  // Save messages to localStorage when messages change
  useEffect(() => {
    localStorage.setItem("ranga-messages", JSON.stringify(messages))
  }, [messages])

  const addMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev.slice(-19), message]) // Keep only last 20 messages
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMessage()
    }
  }

  // Phase 0: White page
  if (animationPhase === 0) {
    return <div className="w-full min-h-screen bg-white"></div>
  }

  // Phase 2: Gap (blank white page)
  if (animationPhase === 2) {
    return <div className="w-full min-h-screen bg-white"></div>
  }

  return (
    <div className="w-full min-h-screen bg-white relative overflow-y-auto">
      {/* Main content container */}
      <div className="flex flex-col items-center pt-20 pb-8 px-4">
        {/* Title section - fixed height container to prevent movement */}
        <div className="h-80 flex flex-col items-center justify-center text-center mb-8">
          {/* Phase 1: Lo! */}
          {animationPhase === 1 && (
            <h1 className="text-6xl md:text-8xl font-bold text-black luminari">
              Lo<span className="text-orange-500">!</span>
            </h1>
          )}

          {/* Phase 3: Behold! */}
          {animationPhase === 3 && (
            <h1 className="text-6xl md:text-8xl font-bold text-black luminari">
              Behold<span className="text-orange-500">!</span>
            </h1>
          )}

          {/* Phase 4+: Ranga? (appears in same position as Lo!/Behold!) */}
          {animationPhase >= 4 && (
            <div className="flex flex-col items-center">
              <h1 className="text-7xl md:text-9xl font-bold text-black luminari mb-4">
                Ranga<span className="text-orange-500">?</span>
              </h1>

              {/* Phase 5+: "So here..." fades in below */}
              {animationPhase >= 5 && (
                <div
                  className={`text-xl md:text-2xl text-black luminari leading-relaxed text-center ${
                    animationPhase === 5 ? "opacity-0 animate-in fade-in duration-[2200ms] fill-mode-forwards" : ""
                  }`}
                >
                  <p>
                    So here Ranga stays<span className="text-orange-500">,</span> a stone alone
                    <span className="text-orange-500">,</span> Argara saved
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rest of page content - appears below the title section */}
        {animationPhase >= 6 && (
          <div className="w-full max-w-4xl space-y-8">
            {/* Experience Options - only show in phase 7+ */}
            {(animationPhase >= 7 || skipAnimation) && (
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Card className="bg-gray-50 border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4">
                    <Sparkles className="w-12 h-12 text-orange-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-black luminari">Full Experience</h3>
                    <p className="text-black min-h-[3rem] flex items-center justify-center">
                      <span className="text-orange-500">3</span>D statue<span className="text-orange-500">,</span>{" "}
                      reactive lights
                    </p>
                    <Button
                      onClick={onEnterCave}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold luminari"
                    >
                      Enter the Cave
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4">
                    <Volume2 className="w-12 h-12 text-orange-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-black luminari">Music Only</h3>
                    <p className="text-black min-h-[3rem] flex items-center justify-center">Just the tracks</p>
                    <Button
                      onClick={onMusicOnly}
                      className="w-full bg-black hover:bg-gray-800 text-white font-bold luminari"
                    >
                      Listen Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Question mark button - positioned just above the logo */}
            {(animationPhase >= 7 || skipAnimation) && (
              <div className="flex justify-center mb-2">
                <Button
                  onClick={() => setShowHelp(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold luminari w-12 h-12 rounded-full text-xl"
                >
                  ?
                </Button>
              </div>
            )}

            {/* Logo below the buttons */}
            {(animationPhase >= 7 || skipAnimation) && (
              <div className="flex justify-center mt-4">
                <img src="/ranga/images/song-inside-logo.png" alt="Song Inside Logo" className="h-20 opacity-80" />
              </div>
            )}

            {/* Footer */}
            <div className="text-sm text-gray-600 space-y-2 text-center">
              <p>Created by Oli Ranga with <a href="https://anthonite.ltd" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Anthonite</a></p>
              <p>
                <a
                  href="https://linktr.ee/olranga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  linktr<span className="text-black">.</span>ee<span className="text-black">/</span>olranga
                </a>
              </p>
            </div>

            {/* Message Board */}
            {(animationPhase >= 7 || skipAnimation) && (
              <div className="mt-8">
                <div className="flex flex-col items-center">
                  <Button
                    onClick={() => setShowMessageBoard(!showMessageBoard)}
                    className="bg-orange-500 hover:bg-orange-600 text-white mb-4 luminari"
                    size="sm"
                  >
                    Say yo! {showMessageBoard ? "▼" : "▲"}
                  </Button>

                  {showMessageBoard && (
                    <Card className="bg-gray-50 border-2 border-orange-500 max-w-md w-full">
                      <CardContent className="p-4">
                        <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                          {messages.length === 0 ? (
                            <p className="text-gray-600 text-xs text-center luminari">
                              No messages yet... be the first!
                            </p>
                          ) : (
                            messages.slice(-10).map((message) => (
                              <div
                                key={message.id}
                                className="text-xs p-2 bg-orange-50 border border-orange-200 rounded"
                              >
                                <span className="text-black luminari">{message.text}</span>
                                <div className="text-gray-500 text-xs mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            maxLength={100}
                            className="flex-1 px-2 py-1 text-xs bg-white border-2 border-gray-300 rounded text-black placeholder-gray-500 focus:outline-none focus:border-orange-500"
                          />
                          <Button
                            onClick={addMessage}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3"
                            disabled={!newMessage.trim()}
                          >
                            Send
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-white border-2 border-orange-500 max-w-4xl max-h-[80vh] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-5xl font-bold text-black luminari">
                  Yo<span className="text-orange-500">!</span>
                </h2>
                <Button
                  onClick={() => setShowHelp(false)}
                  variant="ghost"
                  size="sm"
                  className="text-black hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] pr-2 text-sm leading-relaxed space-y-4 text-black">
                <p>
                  Thanks for being here in <span className="luminari text-orange-500">Ranga's</span> cave. You might
                  have one of these statues, but do you know the whole story?
                </p>

                <p>
                  Long ago, in the cave inside the earth, <span className="luminari text-orange-500">Ranga</span> banged
                  and banged and banged. He loved to drum, and drummed on everything around everyone. He travelled
                  around the kingdom he called{" "}
                  <span className="luminari" style={{ color: "#00BFFF" }}>
                    Argara
                  </span>
                  , until he found{" "}
                  <span className="luminari" style={{ color: "#8B4513" }}>
                    Shuk
                  </span>
                  , a mountain that rose high up towards the central floating core in the inside of the earth. Inside{" "}
                  <span className="luminari" style={{ color: "#8B4513" }}>
                    Shuk
                  </span>{" "}
                  is a magical infinite cave, the cave is known for having the most interesting echo effect.
                </p>

                <p>
                  The echoes would become alive and dance in the cave, they would take forms and find rocks to bang, the
                  echoes created shadows who grew winds and sparks that created harps, gongs, fubarbettes and any
                  instrument he could imagine. <span className="luminari text-orange-500">Ranga</span> loved this cave,
                  and he spent many years alone here banging and banging and banging with his own echoes, the music you
                  can hear here.
                </p>

                <p>
                  As this went on{" "}
                  <span className="luminari" style={{ color: "#8B4513" }}>
                    Shuk
                  </span>
                  , the mountain <span className="luminari text-orange-500">Ranga</span> lived inside began to dance.{" "}
                  <span className="luminari" style={{ color: "#8B4513" }}>
                    Shuk
                  </span>{" "}
                  is one of the biggest mountains of{" "}
                  <span className="luminari" style={{ color: "#00BFFF" }}>
                    Argara
                  </span>
                  , and their dancing caused so much fuss. All kinds of muck, dust and smoke covered stone city, and the
                  dust was laying thick on crystal city; so{" "}
                  <span className="luminari" style={{ color: "#00BFFF" }}>
                    Argara
                  </span>{" "}
                  decided to do something about it.
                </p>

                <p>
                  <span className="luminari" style={{ color: "#00BFFF" }}>
                    Argara
                  </span>{" "}
                  sent out an ask for help, they asked for someone to stop{" "}
                  <span className="luminari text-orange-500">Ranga</span>. So came the witch and sage,{" "}
                  <span className="luminari" style={{ color: "#00FF00" }}>
                    Nana
                  </span>{" "}
                  &{" "}
                  <span className="luminari" style={{ color: "#8A2BE2" }}>
                    Azar
                  </span>
                  . They travelled together, and entered <span className="luminari text-orange-500">Ranga's</span> cave.
                </p>

                <p>
                  <span className="luminari" style={{ color: "#8A2BE2" }}>
                    Azar
                  </span>{" "}
                  went first, but as soon as he heard the music he couldn't help but to dance and play. He drummed as
                  well and piped upon his flute, he grew into a cluster of red balloons on the roof and flew away each
                  time he came close to <span className="luminari text-orange-500">Ranga's</span> way.
                </p>

                <p>
                  So{" "}
                  <span className="luminari" style={{ color: "#00FF00" }}>
                    Nana
                  </span>{" "}
                  kept it simple, and in a poof of smoke, arrived behind{" "}
                  <span className="luminari text-orange-500">Ranga</span> singing her own song. She clicked her fingers
                  and in an instant, <span className="luminari text-orange-500">Ranga</span> was turned to stone.
                </p>

                <p>
                  "Slippy slop this smock, he can for now live as a rock"{" "}
                  <span className="luminari" style={{ color: "#00FF00" }}>
                    Nana
                  </span>{" "}
                  cackled.
                </p>

                <p>
                  to which{" "}
                  <span className="luminari" style={{ color: "#8A2BE2" }}>
                    Azar
                  </span>{" "}
                  added a twist to the spell.
                </p>

                <p>"Until we need the music for the change of days"</p>

                <p>--</p>

                <p>
                  So here, for you is <span className="luminari text-orange-500">Ranga</span>, You can play with the
                  sliders, the buttons and listen through 24 hours of his earliest music.{" "}
                  <span className="luminari text-orange-500">Ranga</span> is ultimately{" "}
                  <span className="luminari text-orange-500">Oli</span>, if you would like to check out{" "}
                  <span className="luminari text-orange-500">Ranga's</span> music and see what he's up to these days you
                  can follow this linktree :)
                </p>

                <p>
                  <a
                    href="https://linktr.ee/olranga"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 underline luminari"
                  >
                    https://linktr.ee/olranga
                  </a>
                </p>

                <p>
                  <a
                    href="https://ko-fi.com/olranga"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 underline luminari"
                  >
                    https://ko-fi.com/olranga
                  </a>
                </p>

                <p>
                  Thanks again<span className="text-orange-500">!</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
