"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type Step = "colour" | "name" | "dob" | "birthplace" | "word" | "chat"

interface UserProfile {
  colour: string
  name: string
  dateOfBirth: string
  placeOfBirth: string
  wordOfTheDay: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
  startTime: number
}

const emojis = ["✨", "🌸", "🍃", "🌙", "💫", "🌿", "🦋", "🌊", "☁️", "🌺"]

export default function ZenApp() {
  const [step, setStep] = useState<Step>("colour")
  const [inputValue, setInputValue] = useState("")
  const [profile, setProfile] = useState<UserProfile>({
    colour: "",
    name: "",
    dateOfBirth: "",
    placeOfBirth: "",
    wordOfTheDay: "",
  })
  const [bgColor, setBgColor] = useState("#ffffff")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [journeyStarted, setJourneyStarted] = useState(false)
  const emojiIdRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const placeholders: Record<Step, string> = {
    colour: "what is your favourite colour?",
    name: "what is your name?",
    dob: "and when were you born?",
    birthplace: "where were you born?",
    word: "and your word of the day?",
    chat: "",
  }

  const nextStep: Record<Step, Step> = {
    colour: "name",
    name: "dob",
    dob: "birthplace",
    birthplace: "word",
    word: "chat",
    chat: "chat",
  }

  useEffect(() => {
    if (!journeyStarted) return

    const interval = setInterval(() => {
      setFloatingEmojis((prev) => {
        const now = Date.now()
        const filtered = prev.filter((e) => now - e.startTime < 15000)

        if (filtered.length < 5 && Math.random() < 0.3) {
          const newEmoji: FloatingEmoji = {
            id: emojiIdRef.current++,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * 80 + 10,
            startTime: now,
          }
          return [...filtered, newEmoji]
        }
        return filtered
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [journeyStarted])

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return

    setShowInput(false)

    if (step === "colour") {
      setBgColor(inputValue.trim())
      setProfile((p) => ({ ...p, colour: inputValue.trim() }))
      setJourneyStarted(true)

      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setStep(nextStep[step])
          setInputValue("")
          setShowInput(true)
          setIsTransitioning(false)
        }, 2000)
      }, 100)
    } else {
      const fieldMap: Record<Step, keyof UserProfile> = {
        colour: "colour",
        name: "name",
        dob: "dateOfBirth",
        birthplace: "placeOfBirth",
        word: "wordOfTheDay",
        chat: "wordOfTheDay",
      }

      setProfile((p) => ({ ...p, [fieldMap[step]]: inputValue.trim() }))

      setTimeout(() => {
        setStep(nextStep[step])
        setInputValue("")
        setTimeout(() => setShowInput(true), 300)
      }, 500)
    }
  }, [inputValue, step])

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return

    const newMessage: Message = { role: "user", content: chatInput.trim() }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setChatInput("")
    setIsLoading(true)
    setDisplayedLines([])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile: {
            name: profile.name,
            colour: profile.colour,
            dateOfBirth: profile.dateOfBirth,
            placeOfBirth: profile.placeOfBirth,
            wordOfTheDay: profile.wordOfTheDay,
          },
        }),
      })

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "...",
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (data.emojis && data.emojis.length > 0) {
        const now = Date.now()
        const newEmojis: FloatingEmoji[] = data.emojis.map((emoji: string) => ({
          id: emojiIdRef.current++,
          emoji,
          x: Math.random() * 80 + 10,
          startTime: now,
        }))
        setFloatingEmojis((prev) => [...prev, ...newEmojis])
      }

      const lines = assistantMessage.content.split("\n").filter(Boolean)
      lines.forEach((line, i) => {
        setTimeout(() => {
          setDisplayedLines((prev) => [...prev, line])
        }, i * 400)
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "a moment of silence..." },
      ])
      setDisplayedLines(["a moment of silence..."])
    } finally {
      setIsLoading(false)
    }
  }, [chatInput, messages, profile, isLoading])

  // Auto-send first message when chat begins
  useEffect(() => {
    if (step === "chat" && messages.length === 0 && profile.wordOfTheDay) {
      const firstMessage: Message = {
        role: "user",
        content: `my word of the day is: ${profile.wordOfTheDay}`,
      }
      setMessages([firstMessage])
      setIsLoading(true)

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [firstMessage],
          userProfile: {
            name: profile.name,
            colour: profile.colour,
            dateOfBirth: profile.dateOfBirth,
            placeOfBirth: profile.placeOfBirth,
            wordOfTheDay: profile.wordOfTheDay,
          },
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          const assistantMessage: Message = {
            role: "assistant",
            content: data.message || "...",
          }
          setMessages([firstMessage, assistantMessage])
          if (data.emojis?.length > 0) {
            const now = Date.now()
            setFloatingEmojis(
              data.emojis.map((emoji: string) => ({
                id: emojiIdRef.current++,
                emoji,
                x: Math.random() * 80 + 10,
                startTime: now,
              }))
            )
          }
          const lines = assistantMessage.content.split("\n").filter(Boolean)
          lines.forEach((line, i) => {
            setTimeout(() => {
              setDisplayedLines((prev) => [...prev, line])
            }, i * 400)
          })
        })
        .catch(() => {
          setMessages([firstMessage, { role: "assistant", content: "a moment of silence..." }])
          setDisplayedLines(["a moment of silence..."])
        })
        .finally(() => setIsLoading(false))
    }
  }, [step])

  const textColor = getContrastColor(bgColor)

  if (step === "chat") {
    return (
      <main
        className="min-h-screen flex flex-col transition-colors duration-1000"
        style={{ backgroundColor: bgColor }}
      >
        {journeyStarted && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {floatingEmojis.map((e) => (
              <span
                key={e.id}
                className="absolute text-lg animate-float-up"
                style={{
                  left: `${e.x}%`,
                  bottom: "-40px",
                  opacity: 0.2,
                }}
              >
                {e.emoji}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 animate-fade-in">
          <div className="max-w-xl w-full space-y-8">
            {messages.filter((m) => m.role === "assistant").length === 0 && (
              <p
                className="text-center font-serif text-lg leading-relaxed opacity-40"
                style={{ color: textColor }}
              >
                speak, {profile.name}...
              </p>
            )}

            {messages.map((msg, idx) =>
              msg.role === "assistant" ? (
                <div key={idx} className="space-y-4">
                  {(idx === messages.length - 1
                    ? displayedLines
                    : msg.content.split("\n").filter(Boolean)
                  ).map((line, lineIdx) => (
                    <p
                      key={lineIdx}
                      className="text-center font-serif text-lg leading-loose animate-fade-in"
                      style={{
                        color: textColor,
                        animationDelay: `${lineIdx * 100}ms`,
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-8 flex justify-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="..."
            disabled={isLoading}
            className="w-full max-w-md bg-transparent border-0 border-b outline-none font-serif text-center text-lg py-2 placeholder:opacity-30 disabled:opacity-50 mix-blend-difference"
            style={{
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center transition-all"
      style={{
        backgroundColor: bgColor,
        transitionDuration: isTransitioning ? "2000ms" : "0ms",
      }}
    >
      {journeyStarted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {floatingEmojis.map((e) => (
            <span
              key={e.id}
              className="absolute text-lg animate-float-up"
              style={{
                left: `${e.x}%`,
                bottom: "-40px",
                opacity: 0.2,
              }}
            >
              {e.emoji}
            </span>
          ))}
        </div>
      )}

      <div
        className={`transition-opacity duration-500 ${
          showInput ? "opacity-100" : "opacity-0"
        }`}
      >
        <input
          type={step === "dob" ? "date" : "text"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholders[step]}
          autoFocus
          className="bg-transparent border-0 border-b outline-none font-serif text-center text-xl py-2 w-80 placeholder:font-light mix-blend-difference"
          style={{
            color: "#ffffff",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        />
      </div>
    </main>
  )
}

function getContrastColor(bgColor: string): string {
  if (typeof document === "undefined") return "#1a1a1a"

  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return "#1a1a1a"

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, 1, 1)
  const imgData = ctx.getImageData(0, 0, 1, 1).data
  const r = imgData[0], g = imgData[1], b = imgData[2]

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#1a1a1a" : "#f5f5f5"
}
