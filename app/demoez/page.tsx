"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, ChevronDown, ChevronRight, Volume2 } from "lucide-react"

const hipHopFonts = [
  "font-mono",
  "font-serif",
  "font-sans",
  "tracking-wider font-bold",
  "tracking-widest font-black",
  "font-mono tracking-tight",
  "font-serif italic",
  "font-sans font-extrabold",
]

const backgroundColors = [
  "bg-rose-600",
  "bg-pink-500",
  "bg-purple-600",
  "bg-indigo-600",
  "bg-blue-600",
  "bg-teal-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-red-600",
  "bg-violet-600",
]

const textColors = ["text-white", "text-rose-50", "text-pink-50", "text-purple-50"]

const streetFonts = [
  "font-black tracking-widest uppercase",
  "font-mono font-extrabold tracking-wider",
  "font-sans font-black italic tracking-wide",
  "font-serif font-bold tracking-tighter",
  "font-mono font-extrabold tracking-widest",
  "font-sans font-black tracking-normal",
  "font-serif font-bold italic tracking-wide",
  "font-mono font-black tracking-wider",
]

const albumFonts = {
  wolly: "font-black tracking-widest uppercase text-shadow-lg",
  banga: "font-mono font-extrabold tracking-wider italic",
  sanga: "font-serif font-black tracking-tight",
  "perfect elephants": "font-sans font-extrabold tracking-wide",
  "dance?": "font-mono font-black tracking-widest",
  "dada shanti": "font-serif font-bold italic tracking-normal",
}

const uniqueFonts = [
  "font-mono font-black tracking-widest uppercase",
  "font-serif font-extrabold italic tracking-tight",
  "font-sans font-bold tracking-wider",
  "font-mono font-light tracking-normal italic",
  "font-serif font-black tracking-widest",
  "font-sans font-extrabold tracking-tight uppercase",
  "font-mono font-medium tracking-wide",
  "font-serif font-bold italic tracking-normal",
  "font-sans font-black tracking-widest",
  "font-mono font-extrabold tracking-tight",
  "font-serif font-light tracking-wider italic",
  "font-sans font-light tracking-normal italic",
  "font-mono font-black tracking-wide",
  "font-serif font-extrabold tracking-tight",
  "font-sans font-medium italic tracking-widest",
  "font-mono font-bold tracking-normal",
  "font-serif font-black tracking-wider uppercase",
  "font-sans font-light tracking-tight italic",
  "font-mono font-extrabold tracking-widest",
  "font-serif font-bold tracking-normal",
  "font-sans font-black italic tracking-wide",
  "font-mono font-medium tracking-tight uppercase",
  "font-serif font-extrabold tracking-widest",
  "font-sans font-light tracking-normal italic",
  "font-mono font-bold tracking-wider",
  "font-serif font-black tracking-tight uppercase",
  "font-sans font-extrabold italic tracking-widest",
  "font-mono font-medium tracking-normal",
  "font-serif font-bold tracking-wide",
  "font-sans font-black tracking-tight italic",
]

const FloatingEmoji = ({ emoji, delay }: { emoji: string; delay: number }) => {
  return (
    <div
      className="fixed text-4xl pointer-events-none z-10 opacity-60"
      style={{
        animation: `float ${15 + Math.random() * 10}s infinite linear ${delay}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    >
      {emoji}
    </div>
  )
}

export default function WebPlayer() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [demos] = useState({
    wolly: [
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/WOLYYYY_oli.mp3",
        name: "WOLYYYY oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/banga%205%20-%20oli.mp3",
        name: "banga 5 - oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/78%20kalimba_oli.mp3",
        name: "78 kalimba oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/KONO.mp3",
        name: "KONO",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/hire%20power_oli.mp3",
        name: "hire power oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/jon_oli.mp3",
        name: "jon oli",
      },
    ],
    banga: [
      {
        url: "https://rangatracks.b-cdn.net/demos/SEPTEMBER/banga%206%20-%20oli.mp3",
        name: "banga 6 - oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/banga4.mp3",
        name: "banga4",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/BANGA%20ONE.wav",
        name: "BANGA ONE",
      },
    ],
    sanga: [
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/SONG%20ONE%20N%20TWO.wav",
        name: "SONG ONE N TWO",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/ol%20-%20The%20Elephants%20Graveyard.wav",
        name: "ol - The Elephants Graveyard",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/ol%20-%20pon%20de%20avon.wav",
        name: "ol - pon de avon",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/CLOUD%20BEAT.wav",
        name: "CLOUD BEAT",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/WOLLY.wav",
        name: "WOLLY",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/sanga%20demos/WYRT.wav",
        name: "WYRT",
      },
    ],
    "perfect elephants": [
      {
        url: "https://rangatracks.b-cdn.net/demos/home/Home%20(mastered).wav",
        name: "Home (mastered)",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/home/Perfect%20Elephants%20(mastered).wav",
        name: "Perfect Elephants (mastered)",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/home/Feast.wav",
        name: "Feast",
      },
    ],
    "dance?": [
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/124%20shake_ranga_bangas.mp3",
        name: "124 shake ranga bangas",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/aku%20aku_ranga.mp3",
        name: "aku aku ranga",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/Alien_Lea%20%26%20Ol'.mp3",
        name: "Alien Lea & Ol'",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/djjelly_oli.mp3",
        name: "djjelly oli",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/lgno_ranga.mp3",
        name: "lgno ranga",
      },
      {
        url: "https://rangatracks.b-cdn.net/demos/AUGUST/Ranga%20-%20Ol'%20-%20Fortune%20.aif",
        name: "Ranga - Ol' - Fortune",
      },
    ],
    "dada shanti": [
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20%20Outbreak.mp3",
        name: "Dada Shanti - Outbreak",
      },
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20Da%20Great%20Crocodile.mp3",
        name: "Dada Shanti - Da Great Crocodile",
      },
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20Healing%20Dub.mp3",
        name: "Dada Shanti - Healing Dub",
      },
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20More%20Love%20(Remix)%20mix%202.wav",
        name: "Dada Shanti - More Love (Remix) mix 2",
      },
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20Plants.wav",
        name: "Dada Shanti - Plants",
      },
      {
        url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Godman%20-%20Dada%20Shanti-1.wav",
        name: "Godman - Dada Shanti",
      },
    ],
  })

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    wolly: true,
    banga: false,
    sanga: false,
    "perfect elephants": false,
    "dance?": false,
    "dada shanti": false,
  })
  const [currentFolder, setCurrentFolder] = useState("wolly")
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTrack, setCurrentTrack] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [bgColor, setBgColor] = useState("bg-rose-600")
  const [textColor, setTextColor] = useState("text-white")
  const [font, setFont] = useState("font-mono")
  const [isFading, setIsFading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const isDadaShantiTrack = currentFolder === "dada shanti"
  const isPerfectElephantsTrack = currentFolder === "perfect elephants"
  const isSangaTrack = currentFolder === "sanga"
  const isWollyTrack = currentFolder === "wolly"
  const isBangaTrack = currentFolder === "banga"
  const isDanceTrack = currentFolder === "dance?"

  const renderTextWithDifferentFonts = (text: string) => {
    return text.split(" ").map((word, index) => {
      const fontClass = uniqueFonts[index % uniqueFonts.length]
      return (
        <span key={index} className={fontClass}>
          {word}
          {index < text.split(" ").length - 1 ? " " : ""}
        </span>
      )
    })
  }

  const randomizeStyles = () => {
    setIsFading(true)
    setTimeout(() => {
      setBgColor(backgroundColors[Math.floor(Math.random() * backgroundColors.length)])
      setTextColor(textColors[Math.floor(Math.random() * textColors.length)])
      setFont(streetFonts[Math.floor(Math.random() * streetFonts.length)])
      setIsFading(false)
    }, 300)
  }

  const loadTrack = (folder: string, index: number) => {
    const folderTracks = demos[folder as keyof typeof demos]
    if (folderTracks[index] && audioRef.current) {
      const wasPlaying = isPlaying
      setIsPlaying(false)

      audioRef.current.src = folderTracks[index].url
      setCurrentTrack(folderTracks[index].name)
      setCurrentFolder(folder)
      setCurrentTrackIndex(index)
      randomizeStyles()

      if (wasPlaying) {
        audioRef.current.load()
        audioRef.current.addEventListener(
          "canplay",
          () => {
            audioRef.current?.play()
            setIsPlaying(true)
          },
          { once: true },
        )
      }
    }
  }

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }))
  }

  const copyFolderLink = (folder: string) => {
    const url = `${window.location.origin}${window.location.pathname}?folder=${encodeURIComponent(folder)}`
    navigator.clipboard.writeText(url)
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const folder = urlParams.get("folder")
    if (folder && demos[folder as keyof typeof demos]) {
      setCurrentFolder(folder)
      setExpandedFolders((prev) => ({ ...prev, [folder]: true }))
      if (demos[folder as keyof typeof demos].length > 0) {
        loadTrack(folder, 0)
      }
    } else if (demos["wolly"].length > 0) {
      loadTrack("wolly", 0)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleEnded = () => {
        setIsPlaying(false)
        randomizeStyles()
        const currentFolderTracks = demos[currentFolder as keyof typeof demos]
        if (currentTrackIndex < currentFolderTracks.length - 1) {
          loadTrack(currentFolder, currentTrackIndex + 1)
        }
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime)
      }

      const handleLoadedMetadata = () => {
        setDuration(audio.duration)
      }

      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)

      return () => {
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [currentTrackIndex, currentFolder])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-1000 ${bgColor} ${textColor} relative overflow-hidden`}>
      <audio ref={audioRef} />

      <FloatingEmoji emoji="🦧" delay={0} />
      <FloatingEmoji emoji="🐅" delay={2} />
      <FloatingEmoji emoji="🦊" delay={4} />
      <FloatingEmoji emoji="🌿" delay={6} />
      <FloatingEmoji emoji="⭐" delay={8} />
      <FloatingEmoji emoji="🧙‍♂️" delay={10} />
      <FloatingEmoji emoji="🌱" delay={12} />
      <FloatingEmoji emoji="✨" delay={14} />
      <FloatingEmoji emoji="🍃" delay={16} />
      <FloatingEmoji emoji="🌟" delay={18} />

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-black/40 backdrop-blur-sm p-2 rounded-lg"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative w-72 md:w-80 bg-black/40 md:bg-black/20 backdrop-blur-sm p-4 md:p-6 border-r border-white/10 transition-transform duration-300 z-40 overflow-y-auto`} style={{ height: '200vh' }}>
        <h2 className="text-2xl md:text-4xl font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 md:mb-6 text-white transform -skew-x-12 text-shadow-2xl font-mono">
          D E M O E S
        </h2>

        <div className="mb-6">
          <a
            href="https://linktr.ee/olranga"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white text-sm underline font-bold tracking-wide"
          >
            previous releases
          </a>
        </div>

        <div className="space-y-2">
          {Object.entries(demos).map(([folder, tracks]) => (
            <div key={folder}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center space-x-2 text-white/90 hover:text-white font-medium py-2"
                >
                  {expandedFolders[folder] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {folder === "wolly" && (
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%283%29-ZKm7p83Q5hZltsIxLlVvsw6fRcstPw.png"
                      alt="Wolly"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  {folder === "banga" && (
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%281%29-0oH1tabbU32pzA19w1XtpfKDwfYa4Y.png"
                      alt="Banga"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  {folder === "dada shanti" && (
                    <img
                      src="/images/dada-shanti-album.jpg"
                      alt="Dada Shanti"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  {folder === "perfect elephants" && (
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-03-05%20184744-qRonu5hLb8rOFHrYUBUFGr03hqhwcG.png"
                      alt="Perfect Elephants"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  {folder === "sanga" && (
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6%20IN%20THE%20CLOUDS%20OF%20BEAUTY.png-mNl4D77Ihohl4Se1opgiXq2Y5A4WjD.jpeg"
                      alt="Sanga"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  {folder === "dance?" && (
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%284%29-ihVKtO5jfhPW8SlS1YszVZ2fStoJ5Y.png"
                      alt="Dance"
                      className="w-6 h-6 rounded-full object-cover mr-1"
                    />
                  )}
                  <span className={albumFonts[folder as keyof typeof albumFonts]}>{folder}</span>
                </button>
                <button
                  onClick={() => copyFolderLink(folder)}
                  className="text-xs text-white/50 hover:text-white/80 px-2 py-1 rounded"
                  title="Copy folder link"
                >
                  🔗
                </button>
              </div>

              {expandedFolders[folder] && (
                <div className="ml-6 space-y-1">
                  {tracks.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => loadTrack(folder, index)}
                      className={`w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-white/10 text-sm ${
                        folder === currentFolder && index === currentTrackIndex
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <div className="font-medium truncate">{track.name}</div>
                    </button>
                  ))}
                  {tracks.length === 0 && <div className="text-white/50 text-sm italic p-2">No demos yet</div>}
                </div>
              )}
            </div>
          ))}
        </div>














      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 mt-16 md:mt-0">
        <div className="text-center space-y-8 md:space-y-12 max-w-2xl w-full">
          {currentTrack && (
            <div className="space-y-6">
              {isWollyTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%283%29-ZKm7p83Q5hZltsIxLlVvsw6fRcstPw.png"
                    alt="Wolly Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              {isBangaTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%281%29-0oH1tabbU32pzA19w1XtpfKDwfYa4Y.png"
                    alt="Banga Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              {isDadaShantiTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="/images/dada-shanti-album.jpg"
                    alt="Dada Shanti Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              {isPerfectElephantsTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-03-05%20184744-qRonu5hLb8rOFHrYUBUFGr03hqhwcG.png"
                    alt="Perfect Elephants Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              {isSangaTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6%20IN%20THE%20CLOUDS%20OF%20BEAUTY.png-mNl4D77Ihohl4Se1opgiXq2Y5A4WjD.jpeg"
                    alt="Sanga Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              {isDanceTrack && (
                <div className="flex justify-center mb-8">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20%284%29-ihVKtO5jfhPW8SlS1YszVZ2fStoJ5Y.png"
                    alt="Dance Album Art"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20 transition-all duration-500 hover:scale-105"
                  />
                </div>
              )}

              <h1
                className={`text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-center animate-pulse leading-tight text-balance transition-opacity duration-300 ${isFading ? "opacity-30" : "opacity-100"}`}
              >
                {renderTextWithDifferentFonts(currentTrack)}
              </h1>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={togglePlay}
                disabled={!currentTrack}
                size="lg"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" /> : <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />}
              </Button>
            </div>

            {/* Timeline */}
            {currentTrack && (
              <div className="w-full max-w-xs md:max-w-md mx-auto space-y-2">
                <div
                  className="h-2 bg-white/20 rounded-full cursor-pointer backdrop-blur-sm border border-white/10 overflow-hidden"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-white/60 transition-all duration-100 rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs md:text-sm text-white/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Volume Control */}
            <div className="flex justify-center items-center space-x-4">
              <div className="relative">
                <Button
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>

                {showVolumeSlider && (
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-12">
            <Button
              onClick={() => setShowContact(!showContact)}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Contact
            </Button>

            {showContact && (
              <div className="mt-4 p-3 md:p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <p className="text-base md:text-lg text-white/90 break-all">oliver.david.hudson@gmail.com</p>
                <p className="text-xs md:text-sm text-white mt-2">all tracks produced by Ranga ready for demonstration</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 md:mt-16 max-w-4xl mx-auto text-center space-y-4 md:space-y-6 px-2 md:px-4">
          <div className="text-xl md:text-2xl lg:text-3xl text-white font-bold mb-4 md:mb-8">thanks for listening :) 😊</div>

          <div className="text-base md:text-xl lg:text-2xl text-white font-semibold mb-4 md:mb-6">
            if you like anything get in touch yo. i'm at{" "}
            <a href="mailto:oli.ranga.tunes@gmail.com" className="underline hover:text-white/80 break-all">
              oli.ranga.tunes@gmail.com
            </a>
          </div>



          <div className="text-sm md:text-base lg:text-lg text-white leading-relaxed space-y-3 md:space-y-4 max-w-3xl mx-auto">
            <p>
              <strong>Oliver Hudson</strong> is a <strong>musician</strong>, <strong>writer</strong>,{" "}
              <strong>events programmer</strong> and general weird <strong>artist</strong> based in{" "}
              <strong>Liverpool</strong>. These <strong>productions</strong> are all unreleased and ready for the final
              touches. <strong>Oli</strong> works with <strong>hardware</strong>, <strong>friends</strong>, esoteric{" "}
              <strong>mathematics</strong> and the <strong>morning</strong>.
            </p>

            <p>
              After releasing his debut <strong>album</strong> 10+ years ago, <strong>Oli</strong> recently released a
              sell out vinyl <strong>LP</strong> on <strong>Third Place Records</strong> in <strong>London</strong> (
              <strong>KONG EP</strong>) as <strong>Ranga</strong>, and more recently an <strong>album</strong> (
              <strong>PAST LIFE</strong>) on <strong>Secquencias Temporales</strong> in <strong>Mexico</strong> as{" "}
              <strong>Ranga</strong>.
            </p>

            <p>
              <strong>Oli</strong> now is moving onto live <strong>performances</strong> and a story based{" "}
              <strong>event</strong>, but these <strong>demos</strong> could find a happy <strong>home</strong> on a{" "}
              <strong>label</strong> somewhere if anyone will have them. <strong>Oli</strong> doesn't use{" "}
              <strong>agents</strong> or <strong>management</strong> cause he's incredibly poor and has never received
              any <strong>money</strong> for his <strong>work</strong>, so instead he writes in third{" "}
              <strong>person</strong> in a hope to appear professional. He is in no way professional, but real as they
              come and works hard on making interesting <strong>sounds</strong> and <strong>visuals</strong> true to the{" "}
              <strong>cause</strong> of <strong>WYRD</strong>, the original weird.
            </p>

            <p className="text-lg font-semibold">
              Blessings from the <strong>deep</strong>
            </p>

            <p className="text-xl font-bold">ol'</p>

            <p>
              to see his other <strong>project</strong> <strong>Ode</strong> check out{" "}
              <a
                href="https://linktr.ee/wyrdode"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/80 font-semibold"
              >
                https://linktr.ee/wyrdode
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
          }
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}