"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei/core/OrbitControls.js"
import { useRef, useEffect, useState, useCallback, Suspense } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Volume2 } from "lucide-react"
import WelcomeScreen from "./components/welcome-screen"
import MusicOnlyMode from "./components/music-only-mode"
import RangaModel from "./RangaModel"

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// All your tracks from the CDN
const TRACK_LIST = [
  "-%20-%20.mp3",
  "0_ranga.mp3",
  "01%20Chibz%20%26%20Ranga%20-%20Box%20Of%20Love.mp3",
  "1.%20Beast%20-%20Da%20Ranga.mp3",
  "1n2%20ranga.mp3",
  "02%20-Chibz%20%26%20Ranga%20-%20You%27re%20Enough%20%28Ft%20Martin%20Smith%29.mp3",
  "03%20-%20Chibz%20%26%20Ranga%20-%20Children%20of%20the%20Ghetto.mp3",
  "04%20-%20Chibz%20%26%20Ranga%20-%20Tidal%20Wave.mp3",
  "05%20-%20Chibz%20%26%20Ranga%20-%20Love%20and%20Kindness.mp3",
  "06%20-%20Chibz%20%26%20Ranga%20-%20Whose%20World%20Is%20This.mp3",
  "07%20-%20Chibz%20%26%20Ranga%20-%20Gratitude.mp3",
  "08%20-%20Chibz%20%26%20Ranga%20-%20Lizard.mp3",
  "09%20-%20Chibz%20%26%20Ranga%20-%20Liquid%20Love.mp3",
  "10%20-%20Chibz%20%26%20Ranga%20-%20Love%20and%20Kindness%20%282018%20version%29.mp3",
  "22%28earlysaxmix%29_oli.mp3",
  "22_oli.mp3",
  "38M8.mp3",
  "91%20hop%28inst%2991_ranga%20live.mp3",
  "93%20coast_ranga.mp3",
  "106_ranga%26harambe%28inst%29.mp3",
  "106_ranga%26harambe.mp3",
  "108.9_ranga.mp3",
  "109%20ram_ranga.mp3",
  "111%20dub%20tek.mp3",
  "116%20bananq.mp3",
  "120%20ee.mp3",
  "120¶_ranga.mp3",
  "124%20shake_ranga_bangas.mp3",
  "125vocal.mp3",
  "130healing%20dub.mp3",
  "180%20gram_ranga_bangas.mp3",
  "190gram.mp3",
  "Adushs.mp3",
  "aku%20aku_ranga.mp3",
  "alice_oli.mp3",
  "Alien_Lea%20%26%20Ol'.mp3",
  "angel_oli%20.mp3",
  "Ark.mp3",
  "awh_demo_oli.mp3",
  "B7P8_ranga.mp3",
  "Bambooda_Ranga.mp3",
  "Bananas_ranga.mp3",
  "banderlirro%202.mp3",
  "Beat%201.mp3",
  "Beat%202.mp3",
  "Beat%207.mp3",
  "Beat%209.mp3",
  "beat1.mp3",
  "bermudea_ranga.mp3",
  "birdsong.mp3",
  "birdy%20dub_ranga%20dada%20shanti.mp3",
  "black%20voices%20%28edit%29_ranga.mp3",
  "blackenstine.mp3",
  "blackout.mp3",
  "BLACULA%20_.mp3",
  "blessing_ol.mp3",
  "can't%20do%20it%20wout%20you.mp3",
  "cape%20max.mp3",
  "Champ_Ol.mp3",
  "cheddar%20melt%20%28sex2%29_ranga.mp3",
  "chickery%20pot_ol'.mp3",
  "CHOICE.mp3",
  "conga%20fill%20.mp3",
  "conga_ranga.mp3",
  "deadlymood_ranga%202018.mp3",
  "Dinosaws_Ranga.mp3",
  "Dirty%20Looks.mp3",
  "djjelly_oli.mp3",
  "dogs%20tung_ranga_bangas.mp3",
  "Dreams%20On%20Contentment%20.mp3",
  "dreams%20on%20contentment_ranga.mp3",
  "dreamy%20trip_oli.mp3",
  "Drifty.mp3",
  "Dub%20tonight_Ranga.mp3",
  "earth_ft.jenome_ranga.mp3",
  "earth_ranga&jenome.mp3",
  "East%20End%20Mango.mp3",
  "Empty%20Hands%20Ft%20life's%20Good_Ranga.mp3",
  "Endless%20Good%20Weather_Ranga.mp3",
  "exploration.mp3",
  "faces.mp3",
  "fix_oli.mp3",
  "flat%2034%20pt2_ranga.mp3",
  "flipped%20egg_ranga.mp3",
  "FOESIL%20ROAD%202_oli%20%20.mp3",
  "FOESIL%20ROAD%203_oli%20%20.mp3",
  "forest_ranga.mp3",
  "forest_rangaM.mp3",
  "four%20walls_ranga.mp3",
  "funky%20fingerprints_ranga.mp3",
  "ghost160RNB.mp3",
  "Ginger%20Beer_Ranga.mp3",
  "Glass%20Tiger.mp3",
  "god2_Ol'.mp3",
  "goes%20round%20latin%20edit%20ranga.mp3",
  "gotta%20_ol'.mp3",
  "Great%20Ape%20%28Made%20In%20The%20Church%20Of%20The%20Sitnking%20Bishop%29.mp3",
  "green%20painting.mp3",
  "guess_ol.mp3",
  "Hard.mp3",
  "HARRY%20SIMM%20N%20RANGA%202.mp3",
  "hiptamine_ranga.mp3",
  "hitatattat_ol'.mp3",
  "Holla%20Back_Ranga.mp3",
  "home_ranga.mp3",
  "hoppyfun_.mp3",
  "How%20to%20play%20chess_Ranga.mp3",
  "i%20feel%20like%20u_ranga.mp3",
  "i%20see%20a%20way_ol'.mp3",
  "In%20Da%20City%20%28ft%20David%20Butler%29.mp3",
  "Interlude%202.mp3",
  "intro.mp3",
  "ip%20op_ranga.mp3",
  "ishvara_oli.mp3",
  "Jungle%20Law.mp3",
  "Kaa%20Moof_Ranga_Klangas%20.mp3",
  "Kilt_Ranga.mp3",
  "kreap_ranga.mp3",
  "LA%20SAGE.mp3",
  "last%20beat.mp3",
  "last%20nite%20beat%201.mp3",
  "last%20nite%20beat%202.mp3",
  "lgno_ranga.mp3",
  "lifes%20gone%20down%20low_ranga_edit.mp3",
  "Magic%20Woman.mp3",
  "married_ol'.mp3",
  "matias_ranga.mp3",
  "memorx_ranga%20%5Bunmastered%5D%20%281%29.mp3",
  "memorx_ranga%20%5Bunmastered%5D.mp3",
  "Mexico%2086'.mp3",
  "mezma_ol.mp3",
  "Monkey%20Feelinds%20UNMIXED.mp3",
  "moozy_oli.mp3",
  "night_oli.mp3",
  "nuclear%20war_ranga_bangas.mp3",
  "ol_ol.mp3",
  "ooo_Ol'%20%28beat%29.mp3",
  "orange%20jam%202.mp3",
  "other%20side%20of%20blue%20painting_ranga.mp3",
  "P8D_Ranga.mp3",
  "pancakes.mp3",
  "pank2_ranga%20%281%29.mp3",
  "pank2_ranga.mp3",
  "parrot_ol'.mp3",
  "peef%28draft%29_ranga.mp3",
  "percussion_ranga_bangas1.mp3",
  "Phoo.mp3",
  "Pryamid%203000%20%28Instrumental%20MPC%20version%29.mp3",
  "pure%20gold_chibz&ranga.mp3",
  "raise%20it_ol'.mp3",
  "Ranga%20-%20A%20Waltz%20On%20Venus%20%28M%29.mp3",
  "Ranga%20-%20Anger%20%26%20Happiness%20%20Dampening.mp3",
  "Ranga%20-%20Anger%20%26%20Happiness%20%20In%20My%20Face.mp3",
  "Ranga%20-%20Beats%20-%20Beat%203.mp3",
  "Ranga%20-%20Beats%20-%20Beat%204.mp3",
  "Ranga%20-%20Beats%20-%20Beat%205%266.mp3",
  "Ranga%20-%20Beats%20-%20Foundation%20ft%20Dada%20Shanti.mp3",
  "Ranga%20-%20Beats%20-%20Glass%20Tiger.mp3",
  "Ranga%20-%20Boss%20Man%20%28M%29.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera%202.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Sleep%203.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Sleep.mp3",
  "Ranga%20-%20Dommm%20%28M%29.mp3",
  "Ranga%20-%20East%20End%20Mango%20%28M%29.mp3",
  "Ranga%20-%20Forget%20About%20It%20%28M%29.mp3",
  "RANGA%20-%20KIDS%20-%20BANGA%201.mp3",
  "Ranga%20-%20Nutz%20%28M%29.mp3",
  "Ranga%20-%20Pryamid%203000%20%28M%29.mp3",
  "Ranga%20-%20Reality%20Is%20%28M%29.mp3",
  "RANGA%20-%20TRANCE%20-%20BANGA%201.mp3",
  "Ranga%20-%20Zombies%20%28M%29.mp3",
  "Ranga%20Pizza%20-%20Pizza%20Slice%202.mp3",
  "Ranga%20Pizza%20-%20Pizza%20Slice%203.mp3",
  "Ranga.mp3",
  "Record%20Jam_Ranga.mp3",
  "records_ranga.mp3",
  "romance.mp3",
  "Rum_Ranga.mp3",
  "Runaway_Ranga.mp3",
  "Runaway2_Ranga.mp3",
  "Sassy_Ranga.mp3",
  "sensation.mp3",
  "settle_oli.mp3",
  "sex_ranga%20%5Bpremaster%5D.mp3",
  "sex_ranga.mp3",
  "shamanic%20hip%20hop.mp3",
  "shanty%20hop%28inst%2985_ranga%20live%20.mp3",
  "shi_ol'%20%281%29.mp3",
  "shi_ol'.mp3",
  "Shorts_.mp3",
  "Silver%20Bells%20%26%20Cockle%20Shells.mp3",
  "simplz.mp3",
  "Sky.mp3",
  "skye_ranga_bangas.mp3",
  "Small%20People.mp3",
  "soft%20and%20nice%202017%20ranga%20YOYOYO.mp3",
  "solar%20peeps_ol'.mp3",
  "Space%20Hopper_Ranga.mp3",
  "Star%20Kaff_Ranga.mp3",
  "Stomper.mp3",
  "Street_Ranga.mp3",
  "sun%20ra%20india%20cover_oli.mp3",
  "Swing.mp3",
  "take%20it%20sleazy.mp3",
  "tavener's%20caddy.mp3",
  "TCRL17_oli.mp3",
  "terry%20oldfeild_ranga.mp3",
  "The%20Mask_Ol.mp3",
  "the%20roof%20we%20live%20under.mp3",
  "the%20sweat%20%28remix%29.mp3",
  "the%20worst%20yet_ranga%20%5Bunmastered%5D%20.mp3",
  "the%20worst%20yet_ranga.mp3",
  "thmp_ranga.mp3",
  "tinky%20forest_ranga.mp3",
  "tompo%20house.mp3",
  "Tom's%20Funk%20-%20Ranga%202016%20.mp3",
  "turing_ol'%20%281%29.mp3",
  "turing_ol'.mp3",
  "u%20aint%20no%20jazz%20bruv_ranga%28mstr1%29.mp3",
  "U%20Broke%20My%20Yo_Ranga.mp3",
  "uaintnojazzbruv2018.mp3",
  "Untitled1_Ranga.mp3",
  "Untitled2_Ranga.mp3",
  "uplifting%20shit.mp3",
  "Wake%202.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%201.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%202.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%203.mp3",
  "whenever%20you%20feel%20alone.mp3",
  "White%20Peony_Ranga.mp3",
  "Whomper.mp3",
  "wiff%20waff%20master%202.mp3",
  "wittington%20you%20dick.mp3",
  "wittington%20you%20dick2.mp3",
  "Workout%201_Ranga.mp3",
  "Wyrt.mp3",
  "Yalways%20take%20my%20blues%20away%20_Ranga.mp3",
  "yam%20yam.mp3",
  "Zinabu_Ranga.mp3",
]

// Fixed audio player hook - removed circular dependencies
function useAudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeState, setVolumeState] = useState(0.7)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false)

  // Keep track of playing state
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Create shuffled playlist on mount only
  useEffect(() => {
    const indices = Array.from({ length: TRACK_LIST.length }, (_, i) => i)
    const shuffled = [...indices].sort(() => Math.random() - 0.5)
    setShuffledIndices(shuffled)
  }, [])

  // Stable function to load a track
  const loadTrack = useCallback(
    (index: number, shouldPlay = false) => {
      if (!audioRef.current || shuffledIndices.length === 0) return

      const actualIndex = shuffledIndices[index]
      const trackName = TRACK_LIST[actualIndex]
      const url = `https://rangatracks.b-cdn.net/${trackName}`

      audioRef.current.src = url
      audioRef.current.load()
      setCurrentTrackIndex(index)

      if (shouldPlay) {
        setTimeout(() => {
          audioRef.current
            ?.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false))
        }, 100)
      }
    },
    [shuffledIndices],
  )

  // Stable skip function
  const skipToNext = useCallback(() => {
    if (shuffledIndices.length === 0) return
    const nextIndex = (currentTrackIndex + 1) % shuffledIndices.length
    loadTrack(nextIndex, isPlayingRef.current)
  }, [shuffledIndices.length, currentTrackIndex, loadTrack])

  // Initialize audio element - only when shuffledIndices changes
  useEffect(() => {
    if (shuffledIndices.length === 0) return

    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.volume = volumeState  // Use current volume state for initial volume
    audioRef.current = audio

    const handleEnded = () => {
      skipToNext()
    }

    const handleError = () => {
      console.error("Audio error, skipping to next track")
      skipToNext()
    }

    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    // Load first track
    loadTrack(0, false)

    return () => {
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.pause()
      audioRef.current = null
    }
  }, [shuffledIndices.length]) // Only depend on shuffledIndices, not volumeState to avoid recreating audio on volume change

  // Update volume separately
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Play failed:", error)
          skipToNext()
        })
    }
  }, [isPlaying, skipToNext])

  const getCurrentTrackName = useCallback(() => {
    if (shuffledIndices.length === 0) return "Loading..."
    const actualIndex = shuffledIndices[currentTrackIndex]
    return (
      TRACK_LIST[actualIndex]
        ?.replace(/%20/g, " ")
        .replace(/%27/g, "'")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%26/g, "&")
        .replace(/\.mp3$/, "") || "Unknown Track"
    )
  }, [shuffledIndices, currentTrackIndex])

  const downloadCurrentTrack = useCallback(() => {
    if (shuffledIndices.length === 0) return
    const actualIndex = shuffledIndices[currentTrackIndex]
    const trackName = TRACK_LIST[actualIndex]
    const url = `https://rangatracks.b-cdn.net/${trackName}`

    const link = document.createElement("a")
    link.href = url
    link.download = getCurrentTrackName()
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [shuffledIndices, currentTrackIndex, getCurrentTrackName])

  return {
    isPlaying,
    togglePlayPause,
    skipToNext,
    getCurrentTrackName,
    downloadCurrentTrack,
    audioElement: audioRef.current,
    volume: volumeState,
    setVolume,
  }
}

// Audio analysis hook - simplified for mobile
function useAudioAnalysis(audioElement: HTMLAudioElement | null) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isListening, setIsListening] = useState(true)
  const [audioData, setAudioData] = useState({ volume: 0, bassLevel: 0, midLevel: 0, trebleLevel: 0 })
  const sourceRef = useRef<MediaElementSourceNode | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(isMobile)

  const startListening = async () => {
    try {
      if (audioElement && audioElement.src) {
        if (!audioContext) {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)()

          if (context.state === "suspended") {
            await context.resume()
          }

          const source = context.createMediaElementSource(audioElement)
          const analyserNode = context.createAnalyser()

          analyserNode.fftSize = isMobile ? 512 : 2048
          analyserNode.smoothingTimeConstant = 0.8

          source.connect(analyserNode)
          analyserNode.connect(context.destination)

          sourceRef.current = source
          setAudioContext(context)
          setAnalyser(analyserNode)
        }

        setIsListening(true)
      }
    } catch (error) {
      console.error("Error accessing audio:", error)
    }
  }

  const stopListening = () => {
    setIsListening(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Fast approximation for 10^(x/20) - used in dB to linear conversion
  const fast10pow = useCallback((x: number) => {
    // For dB to linear conversion: 10^(x/20) = e^(x*ln(10)/20)
    const scaled = x * 0.11512925  // ln(10)/20
    return Math.exp(scaled)
  }, [])

  const analyze = useCallback(() => {
    if (!analyser || !audioContext || audioContext.state !== "running") return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const freqArray = new Float32Array(bufferLength)

    analyser.getByteTimeDomainData(dataArray)

    if (isLowPerformanceMode) {
      let sum = 0
      for (let i = 0; i < Math.min(bufferLength, 256); i++) {
        const sample = (dataArray[i] - 128) / 128
        sum += sample * sample
      }
      const volume = Math.sqrt(sum / Math.min(bufferLength, 256))

      setAudioData({
        volume: Math.min(1, volume * 5),
        bassLevel: volume * 0.5,
        midLevel: volume * 0.5,
        trebleLevel: volume * 0.5,
      })
      return
    }

    analyser.getFloatFrequencyData(freqArray)

    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128
      sum += sample * sample
    }
    const volume = Math.sqrt(sum / bufferLength)

    const bassEnd = Math.floor((200 * bufferLength) / (audioContext.sampleRate / 2))
    const midEnd = Math.floor((2000 * bufferLength) / (audioContext.sampleRate / 2))

    let bassSum = 0,
      midSum = 0,
      trebleSum = 0
    let bassCount = 0,
      midCount = 0,
      trebleCount = 0

    for (let i = 1; i < bassEnd; i++) {
      if (freqArray[i] > Number.NEGATIVE_INFINITY) {
        bassSum += fast10pow(freqArray[i])  // Use fast approximation
        bassCount++
      }
    }

    for (let i = bassEnd; i < midEnd; i++) {
      if (freqArray[i] > Number.NEGATIVE_INFINITY) {
        midSum += fast10pow(freqArray[i])  // Use fast approximation
        midCount++
      }
    }

    for (let i = midEnd; i < freqArray.length; i++) {
      if (freqArray[i] > Number.NEGATIVE_INFINITY) {
        trebleSum += fast10pow(freqArray[i])  // Use fast approximation
        trebleCount++
      }
    }

    const bassLevel = bassCount > 0 ? bassSum / bassCount : 0
    const midLevel = midCount > 0 ? midSum / midCount : 0
    const trebleLevel = trebleCount > 0 ? trebleSum / trebleCount : 0

    setAudioData({
      volume: Math.min(1, volume * 10),
      bassLevel: Math.min(1, bassLevel * 100),
      midLevel: Math.min(1, midLevel * 100),
      trebleLevel: Math.min(1, trebleLevel * 100),
    })
  }, [analyser, audioContext, isLowPerformanceMode, fast10pow])

  useEffect(() => {
    if (!analyser || !audioContext || !isListening) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const interval = isMobile ? 100 : 50
    intervalRef.current = setInterval(analyze, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [analyser, audioContext, isListening, isMobile, analyze])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [])

  return { audioData, isListening, startListening, stopListening, isLowPerformanceMode, setIsLowPerformanceMode }
}

// Loading Progress Component
function LoadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="text-white text-xl luminari bg-black/80 px-6 py-4 rounded-lg border border-gray-600">
        <div className="text-center mb-4">Loading Ranga...</div>
        <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-300 text-center">{Math.round(progress)}%</div>
        <div className="text-xs text-gray-400 text-center mt-2">
          {progress < 30 && "Awakening from stone..."}
          {progress >= 30 && progress < 60 && "Loading ancient geometry..."}
          {progress >= 60 && progress < 90 && "Preparing the cave..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  )
}

// Animated Gradient Background Component - optimized for mobile
function DynamicBackground({
  isMobile,
  wizardMode,
  coloredBackground,
}: { isMobile: boolean; wizardMode: boolean; coloredBackground: boolean }) {
  const { scene } = useThree()

  useFrame((state) => {
    if (wizardMode) {
      scene.background = new THREE.Color("#0080ff")
    } else if (coloredBackground) {
      const time = state.clock.elapsedTime
      const r = Math.sin(time * 0.5) * 0.5 + 0.5
      const g = Math.sin(time * 0.7 + 2) * 0.5 + 0.5
      const b = Math.sin(time * 0.3 + 4) * 0.5 + 0.5
      scene.background = new THREE.Color(r * 0.3, g * 0.3, b * 0.3)
    } else {
      scene.background = new THREE.Color("#000000")
    }
  })

  return null
}

// Loading Camera Animation Component
function LoadingCameraAnimation({
  onComplete,
  cameraX,
  cameraY,
  cameraZ,
  targetX,
  targetY,
  targetZ,
}: {
  onComplete: () => void
  cameraX: number
  cameraY: number
  cameraZ: number
  targetX: number
  targetY: number
  targetZ: number
}) {
  const { camera } = useThree()
  const [isAnimating, setIsAnimating] = useState(true)
  const startTime = useRef<number | null>(null)
  const animationDuration = 3000

  useFrame((state) => {
    if (!isAnimating) return

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime * 1000
    }

    const elapsed = state.clock.elapsedTime * 1000 - startTime.current
    const progress = Math.min(elapsed / animationDuration, 1)

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
    const easedProgress = easeInOutCubic(progress)

    const startY = 15
    const startZ = 0
    const startX = 0

    camera.position.y = startY + (cameraY - startY) * easedProgress
    camera.position.z = startZ + (cameraZ - startZ) * easedProgress
    camera.position.x = startX + (cameraX - startX) * easedProgress

    camera.lookAt(targetX, targetY, targetZ)

    if (progress >= 1) {
      setIsAnimating(false)
      onComplete()
    }
  })

  return null
}

// Orbiting Light Component - with more varied colors
function OrbitingLight({
  index,
  baseIntensity,
  audioMultiplier,
  audioData,
  isListening,
  targetPosition,
  shuKnob,
  phiKnob,
  thetaKnob,
  isMobile,
  isLowPerformanceMode,
}: {
  index: number
  baseIntensity: number
  audioMultiplier: number
  audioData: any
  isListening: boolean
  targetPosition: THREE.Vector3
  shuKnob: number
  phiKnob: number
  thetaKnob: number
  isMobile: boolean
  isLowPerformanceMode: boolean
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  // More varied color palettes based on fader values
  const getColorPalette = () => {
    const shuLevel = shuKnob / 4
    const phiLevel = phiKnob / 2
    const thetaLevel = thetaKnob / 5

    if (shuLevel > 0.7) {
      return ["#ff0080", "#00ff80", "#8000ff"] // Pink, Green, Purple
    } else if (phiLevel > 0.7) {
      return ["#80ffff", "#ff8080", "#80ff80"] // Light Blue, Light Red, Light Green
    } else if (thetaLevel > 0.7) {
      return ["#ffff00", "#ff00ff", "#00ffff"] // Yellow, Magenta, Cyan
    } else if (shuLevel > 0.3 || phiLevel > 0.3 || thetaLevel > 0.3) {
      return ["#ff8000", "#8000ff", "#00ff00"] // Orange, Purple, Green
    } else {
      return ["#8000ff", "#00ff00", "#ff8000"] // Default: Purple, Green, Orange
    }
  }

  const colors = getColorPalette()
  const color = colors[index]

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (isLowPerformanceMode) {
      const simpleX = targetPosition.x + Math.cos(time * 0.2 + index) * 1.5
      const simpleZ = targetPosition.z + Math.sin(time * 0.2 + index) * 1.5
      const simpleY = targetPosition.y + 0.5

      if (lightRef.current) {
        lightRef.current.position.set(simpleX, simpleY, simpleZ)
        lightRef.current.intensity = baseIntensity * 0.5
        lightRef.current.color.setHex(Number.parseInt(color.replace("#", "0x")))
      }
      if (sphereRef.current) {
        sphereRef.current.position.set(simpleX, simpleY, simpleZ)
      }
      return
    }

    const baseRadius = 2.5 - phiKnob * 1.0
    const radius = baseRadius + Math.sin(time * 0.5) * 0.5

    const baseSpeed = 0.5 + index * 0.2
    const speed = baseSpeed

    const angleOffset = (index * Math.PI * 2) / 3
    const angle = time * speed + angleOffset

    // Smooth interpolation to target position
    const lerpFactor = 0.02 // Slower movement - lower values = slower
    const currentPos = lightRef.current?.position || new THREE.Vector3()

    const orbitX = targetPosition.x + Math.cos(angle) * radius
    const orbitZ = targetPosition.z + Math.sin(angle) * radius
    const orbitY = targetPosition.y + Math.sin(time * 0.3 + index) * 1.5 + Math.cos(angle * 0.5) * 0.8

    // Lerp towards the target position
    const targetPos = new THREE.Vector3(orbitX, orbitY, orbitZ)
    const smoothedPos = currentPos.lerp(targetPos, lerpFactor)

    if (lightRef.current) {
      lightRef.current.position.copy(smoothedPos)
      const intensity = (baseIntensity + (isListening ? audioData.volume * audioMultiplier : 0)) * (isMobile ? 0.7 : 1)
      lightRef.current.intensity = intensity
      lightRef.current.color.setHex(Number.parseInt(color.replace("#", "0x")))
    }
    if (sphereRef.current) {
      sphereRef.current.position.copy(smoothedPos)
      const material = sphereRef.current.material as THREE.MeshBasicMaterial
      material.color.setHex(Number.parseInt(color.replace("#", "0x")))
    }
  })

  return (
    <>
      <pointLight ref={lightRef} color={color} intensity={baseIntensity} distance={12} decay={1.5} />
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  )
}

// Click Handler Component
function ClickHandler({
  onPositionLock,
  isLocked,
  lightDistance,
}: {
  onPositionLock: (position: THREE.Vector3) => void
  isLocked: boolean
  lightDistance: number
}) {
  const { camera, size } = useThree()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('.ui-card, .ui-button, .ui-slider, [role="slider"], .wizard-icon, .advanced-panel, .dev-panel')
      ) {
        return
      }

      const x = (event.clientX / size.width) * 2 - 1
      const y = -(event.clientY / size.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      const worldPosition = raycaster.ray.origin.clone().add(raycaster.ray.direction.multiplyScalar(lightDistance))

      onPositionLock(worldPosition)
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [camera, size, onPositionLock, lightDistance])

  return null
}

// Mouse Tracker Component
function MouseTracker({
  onMouseMove,
  isActive,
  lightDistance,
}: {
  onMouseMove: (position: THREE.Vector3) => void
  isActive: boolean
  lightDistance: number
}) {
  const { camera, size } = useThree()

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const x = (event.clientX / size.width) * 2 - 1
      const y = -(event.clientY / size.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      const worldPosition = raycaster.ray.origin.clone().add(raycaster.ray.direction.multiplyScalar(lightDistance))

      onMouseMove(worldPosition)
    },
    [camera, size, onMouseMove, lightDistance],
  )

  useEffect(() => {
    if (!isActive) return

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove, isActive])

  return null
}

// RangaStoneModel has been moved to a separate file (RangaModel.tsx)
// to handle client-side only rendering and avoid SSR issues

export default function Page() {
  const isMobile = useIsMobile()
  const audioPlayer = useAudioPlayer()
  const { audioData, isListening, startListening, stopListening, isLowPerformanceMode, setIsLowPerformanceMode } =
    useAudioAnalysis(audioPlayer.audioElement)

  // Updated Ranga's position with your values
  const [statueX] = useState(-6.5)
  const [statueY] = useState(-3.3)
  const [statueZ] = useState(-2.0)
  const [lightDistance] = useState(7.2)

  // Camera and target positions
  const [cameraX, setCameraX] = useState(0.1)
  const [cameraY, setCameraY] = useState(0.6)
  const [cameraZ, setCameraZ] = useState(4.4)
  const [targetX, setTargetX] = useState(-3.8)
  const [targetY, setTargetY] = useState(-1.8)
  const [targetZ, setTargetZ] = useState(-0.7)

  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  const [mousePosition, setMousePosition] = useState(new THREE.Vector3(statueX, statueY, statueZ))
  const [lockedPosition, setLockedPosition] = useState<THREE.Vector3 | null>(null)
  const [isPositionLocked, setIsPositionLocked] = useState(false)

  const [shuKnob, setShuKnob] = useState(4.0)
  const [phiKnob, setPhiKnob] = useState(2.0)
  const [thetaKnob, setThetaKnob] = useState(5.0)
  const [showHelp, setShowHelp] = useState(false)
  const [isControlsMinimized, setIsControlsMinimized] = useState(false)
  const [showSpeechBubble, setShowSpeechBubble] = useState(false)
  const [activeTab, setActiveTab] = useState<'welcome' | 'tutorial' | 'controls'>('tutorial')

  // Easter egg wizard mode
  const [wizardMode, setWizardMode] = useState(false)
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)
  const [wizardVisible, setWizardVisible] = useState(false)

  // Advanced parameters
  const [bassReactivity, setBassReactivity] = useState(1.0)
  const [midReactivity, setMidReactivity] = useState(1.0)
  const [trebleReactivity, setTrebleReactivity] = useState(1.0)
  const [morphSpeed, setMorphSpeed] = useState(1.0)
  const [lightOrbitSpeed, setLightOrbitSpeed] = useState(1.0)
  const [noiseIntensity, setNoiseIntensity] = useState(1.0)
  const [waveFrequency, setWaveFrequency] = useState(1.0)

  // Add missing UI state and handlers
  const [currentTrackName, setCurrentTrackName] = useState("")

  // Add these state variables after the existing ones
  const [showMainControls, setShowMainControls] = useState(false)
  const [coloredBackground, setColoredBackground] = useState(true)

  // Timer for instructions button (30 seconds)
  const [showInstructionsButton, setShowInstructionsButton] = useState(false)

  const handleMouseMove = useCallback((position: THREE.Vector3) => {
    setMousePosition(position)
  }, [])

  // Stable track name update
  useEffect(() => {
    const updateTrackName = () => {
      setCurrentTrackName(audioPlayer.getCurrentTrackName())
    }

    const interval = setInterval(updateTrackName, 1000)
    updateTrackName() // Initial call

    return () => clearInterval(interval)
  }, [audioPlayer.getCurrentTrackName])

  // Timer for wizard appearance (1 minute)
  useEffect(() => {
    const timer = setTimeout(() => {
      setWizardVisible(true)
    }, 60000) // 60 seconds

    return () => clearTimeout(timer)
  }, [])

  // Timer for instructions button (30 seconds after entering cave)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructionsButton(true)
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [])

  // Auto-collapse controls after 1.5 seconds (only once on load)
  useEffect(() => {
    const hasAutoCollapsed = sessionStorage.getItem('controlsAutoCollapsed')

    if (!hasAutoCollapsed) {
      const autoCollapseTimer = setTimeout(() => {
        setShowMainControls(false)
        sessionStorage.setItem('controlsAutoCollapsed', 'true')
      }, 1500) // 1.5 seconds

      return () => clearTimeout(autoCollapseTimer)
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  // Periodic speech bubble animation - only if menu hasn't been toggled
  useEffect(() => {
    const hasToggledMenu = sessionStorage.getItem('menuToggled')

    if (hasToggledMenu) {
      return // Don't show speech bubbles if menu was toggled at least once
    }

    // Show speech bubble periodically
    const showBubble = () => {
      setShowSpeechBubble(true)
      // Hide after 3 seconds
      setTimeout(() => {
        setShowSpeechBubble(false)
      }, 3000)
    }

    // Initial delay of 5 seconds, then show every 20 seconds
    const initialTimer = setTimeout(() => {
      showBubble()
      // Set up recurring interval
      const interval = setInterval(showBubble, 20000)

      // Store interval ID for cleanup
      return () => clearInterval(interval)
    }, 5000)

    return () => clearTimeout(initialTimer)
  }, [])

  const rangaLightEmission = (shuKnob / 4) * 2
  const baseIntensity = (shuKnob / 4) * 3.5 + 1.2
  const audioMultiplier = (shuKnob / 4) * 1.5 + 0.5
  const noiseDistortion = phiKnob * 2.5 * noiseIntensity
  const waveDistortion = phiKnob * 2.5 * waveFrequency
  const morphingEffect = thetaKnob * morphSpeed

  const getThetaColor = (value: number) => {
    const normalizedValue = value / 5
    const red = Math.floor(normalizedValue * 128)
    const green = Math.floor(255 - normalizedValue * 255)
    const blue = Math.floor(normalizedValue * 255)
    return `rgb(${red}, ${green}, ${blue})`
  }

  const handlePositionLock = (position: THREE.Vector3) => {
    if (isPositionLocked) {
      setIsPositionLocked(false)
      setLockedPosition(null)
    } else {
      setIsPositionLocked(true)
      setLockedPosition(position.clone())
    }
  }

  const handleWizardClick = () => {
    setWizardMode(!wizardMode)
    setShowAdvancedPanel(!showAdvancedPanel)
  }

  const targetPosition = isPositionLocked && lockedPosition ? lockedPosition : mousePosition

  const HelpModal = () =>
    showHelp && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Card className="bg-black/95 text-white border-gray-600 max-w-2xl max-h-[80vh] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-5xl font-bold luminari">
                Yo<span className="text-orange-500">!</span>
              </h2>
              <Button
                onClick={() => setShowHelp(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
              >
                ✕
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] pr-2 text-sm leading-relaxed space-y-4">
              <p>
                Thanks for being here in <span className="luminari text-orange-500">Ranga's</span> cave. You might have
                one of these statues, but do you know the whole story?
              </p>

              <p>
                Long ago, in the cave inside the earth, <span className="luminari text-orange-500">Ranga</span> banged
                and banged and banged. He loved to drum, and drummed on everything around everyone. He travelled around
                the kingdom he called{" "}
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
                went first, but as soon as he heard the music he couldn't help but to dance and play. He drummed as well
                and piped upon his flute, he grew into a cluster of red balloons on the roof and flew away each time he
                came close to <span className="luminari text-orange-500">Ranga's</span> way.
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
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  https://linktr.ee/olranga
                </a>
              </p>

              <p>
                <a
                  href="https://ko-fi.com/olranga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  https://ko-fi.com/olranga
                </a>
              </p>

              <p>
                Thanks again<span className="text-orange-500">!</span>
              </p>
              {isMobile && (
                <div className="mt-4 p-3 bg-yellow-900/30 rounded border border-yellow-600">
                  <p className="text-yellow-200 text-xs">
                    <strong>Mobile Tip:</strong> Some effects are reduced on mobile for better performance.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )


  const [currentMode, setCurrentMode] = useState<"welcome" | "cave" | "music-only">("welcome")
  const [hasReturnedFromMode, setHasReturnedFromMode] = useState(false)

  if (currentMode === "welcome") {
    return (
      <WelcomeScreen
        onEnterCave={() => setCurrentMode("cave")}
        onMusicOnly={() => setCurrentMode("music-only")}
        skipAnimation={hasReturnedFromMode}
      />
    )
  }

  if (currentMode === "music-only") {
    return (
      <MusicOnlyMode
        onBack={() => {
          setHasReturnedFromMode(true)
          setCurrentMode("welcome")
        }}
      />
    )
  }

  return (
    <div className="w-full h-screen bg-black">
      <Button
        onClick={() => {
          // Stop the music
          if (audioPlayer.audioElement) {
            audioPlayer.audioElement.pause()
          }
          setHasReturnedFromMode(true)
          setCurrentMode("welcome")
        }}
        variant="outline"
        className="absolute top-4 left-4 z-10 bg-black/80 border-gray-600 text-white hover:bg-gray-800 luminari ui-button"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>


      {/* Wizard Toggle Button with Speech Bubble - Center bottom of screen */}
      {isLoadingComplete && modelLoaded && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
          {/* Speech Bubble */}
          <div
            className={`absolute -top-20 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
              showSpeechBubble
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            }`}
          >
            <div className="relative bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <p className="text-black font-medium text-sm whitespace-nowrap">I can help!</p>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-0 w-0 h-0
                border-l-[8px] border-l-transparent
                border-t-[8px] border-t-white/90
                border-r-[8px] border-r-transparent">
              </div>
            </div>
          </div>

          {/* Wizard Button */}
          <Button
            onClick={() => {
              setShowMainControls(!showMainControls)
              sessionStorage.setItem('toggle', 'true')
            }}
            className={`${
              showMainControls
                ? 'bg-purple-900/70 border-purple-400 shadow-lg shadow-purple-500/50'
                : (() => {
                    const hasToggledMenu = sessionStorage.getItem('menuToggled')
                    return hasToggledMenu
                      ? 'bg-black/60 border-purple-500/50'
                      : 'bg-black/60 border-purple-500/50 slow-pulse'
                  })()
            } text-4xl hover:bg-black/80 hover:border-purple-400 transition-all duration-300 rounded-full w-16 h-16 flex items-center justify-center ui-button transform hover:scale-110`}
            title="Toggle Controls"
          >
            <span className={`transition-transform duration-300 ${showMainControls ? 'rotate-12' : ''}`}>
              🧙
            </span>
          </Button>
        </div>
      )}

      {/* Music Controls - Always visible below wizard */}
      {isLoadingComplete && modelLoaded && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-black/90 border-gray-500/70 shadow-xl backdrop-blur-sm ui-card rounded-lg">
            <CardContent className="p-3">
              <div className="text-white text-sm luminari flex items-center gap-3">
                <Button
                  onClick={audioPlayer.togglePlayPause}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white ui-button w-10 h-10 flex justify-center items-center"
                >
                  {audioPlayer.isPlaying ? "⏸" : "▶"}
                </Button>
                <Button
                  onClick={audioPlayer.skipToNext}
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 text-white ui-button w-10 h-10 flex justify-center items-center"
                >
                  ⏭
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioPlayer.volume}
                  onChange={(e) => audioPlayer.setVolume(Number.parseFloat(e.target.value))}
                  className="w-20 ui-slider"
                />
                {currentTrackName && (
                  <button
                    onClick={audioPlayer.downloadCurrentTrack}
                    className="text-orange-400 hover:text-orange-300 text-xs underline cursor-pointer truncate max-w-[150px]"
                    title="Click to download"
                  >
                    {currentTrackName}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Controls Panel - Responsive Tabbed Window with animation */}
      {isLoadingComplete && modelLoaded && (
        <div
          className={`fixed top-4 right-4 z-10 transition-all duration-500 transform max-w-[calc(100vw-2rem)] ${
            showMainControls
              ? 'translate-x-0 opacity-100 scale-100'
              : 'translate-x-full opacity-0 scale-95 pointer-events-none'
          } ${isMobile ? 'w-full max-w-sm' : 'w-96'}`}
        >
          <Card className="bg-black/95 border-gray-500/70 shadow-2xl backdrop-blur-sm ui-card overflow-hidden rounded-xl">
            {/* Tab Header */}
            <div className="bg-gradient-to-r from-black/90 to-gray-900/90 border-b border-gray-500/50">
              <div className="flex overflow-x-auto scrollbar-hide">
                {/* Tab Buttons */}
                <button
                  onClick={() => setActiveTab('welcome')}
                  className={`${
                    activeTab === 'welcome'
                      ? 'bg-black/95 text-white border-t-2 border-l border-r border-purple-400 border-b-black/95 shadow-lg'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 border-b border-gray-500/50 hover:text-white'
                  } ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} luminari transition-all relative -mb-px z-10 whitespace-nowrap font-medium`}
                >
                  Welcome
                </button>
                <button
                  onClick={() => setActiveTab('tutorial')}
                  className={`${
                    activeTab === 'tutorial'
                      ? 'bg-black/95 text-white border-t-2 border-l border-r border-purple-400 border-b-black/95 shadow-lg'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 border-b border-gray-500/50 hover:text-white'
                  } ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} luminari transition-all relative -mb-px z-10 whitespace-nowrap font-medium`}
                >
                  Tutorial
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`${
                    activeTab === 'controls'
                      ? 'bg-black/95 text-white border-t-2 border-l border-r border-purple-400 border-b-black/95 shadow-lg'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80 border-b border-gray-500/50 hover:text-white'
                  } ${isMobile ? 'px-4 py-2.5 text-xs' : 'px-6 py-3 text-sm'} luminari transition-all relative -mb-px z-10 whitespace-nowrap font-medium`}
                >
                  Controls
                </button>
                {/* Fill remaining space */}
                <div className="flex-1 border-b border-gray-500/50"></div>
              </div>
            </div>

            {/* Tab Content */}
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} bg-black/90`}>
              {activeTab === 'welcome' ? (
                /* Welcome Tab Content */
                <div className={`overflow-y-auto ${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'} pr-2`}>
                  <div className={`space-y-4 text-white leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <h2 className={`font-bold luminari text-gradient bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                      Yo<span className="text-orange-500">!</span>
                    </h2>

                    <p>
                      Thanks for being here in <span className="luminari text-orange-500">Ranga's</span> cave. You might have
                      one of these statues, but do you know the whole story?
                    </p>

                    <p>
                      Long ago, in the cave inside the earth, <span className="luminari text-orange-500">Ranga</span> banged
                      and banged and banged. He loved to drum, and drummed on everything around everyone. He travelled around
                      the kingdom he called{" "}
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
                      went first, but as soon as he heard the music he couldn't help but to dance and play. He drummed as well
                      and piped upon his flute, he grew into a cluster of red balloons on the roof and flew away each time he
                      came close to <span className="luminari text-orange-500">Ranga's</span> way.
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
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        https://linktr.ee/olranga
                      </a>
                    </p>
                  </div>
                </div>
              ) : activeTab === 'tutorial' ? (
                /* Tutorial Tab Content */
                <div className={`overflow-y-auto ${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'} pr-2`}>
                  <div className={`space-y-4 text-white ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    <h3 className={`font-bold luminari text-purple-400 ${isMobile ? 'text-base' : 'text-lg'}`}>Welcome to Ranga's Realm</h3>

                    <div className={`space-y-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <h4 className={`font-bold text-orange-500 ${isMobile ? 'text-sm' : 'text-md'}`}>How to Use:</h4>

                      <p>
                        <span className="text-orange-500 font-bold">🧙 Wizard Button</span>
                        <span className="text-orange-500">:</span> Toggle this menu panel
                      </p>

                      <p>
                        <span className="text-orange-500 font-bold">术</span> <span className="font-bold">(Shu)</span>
                        <span className="text-orange-500">:</span> Controls light intensity and statue glow
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">ф</span> <span className="font-bold">(Phi)</span>
                        <span className="text-orange-500">:</span> Adds noise and wave distortions
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">Θ</span> <span className="font-bold">(Theta)</span>
                        <span className="text-orange-500">:</span> Controls morphing and bulge effects
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">iΘ þн Button</span>
                        <span className="text-orange-500">:</span> Toggle audio reactivity
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">Logo Button</span>
                        <span className="text-orange-500">:</span> Toggle colored background effects
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">Click anywhere</span>
                        <span className="text-orange-500">:</span> Move lights to that position
                      </p>
                      <p>
                        <span className="text-orange-500 font-bold">Click track name</span>
                        <span className="text-orange-500">:</span> Download the current song
                      </p>
                    </div>

                    <div className={`mt-3 ${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-r from-orange-900/40 to-orange-800/30 border border-orange-600/40 rounded-lg shadow-inner`}>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} leading-relaxed`}>
                        <span className="text-orange-400 font-bold">🖥️ Browser Compatibility:</span> This experience works best on desktop computers using
                        Chrome, Firefox, or Safari. If you experience issues, try refreshing the page, enabling hardware
                        acceleration in your browser settings, or switching to a different browser.
                      </p>
                    </div>

                    <div className={`mt-3 ${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-r from-purple-900/40 to-purple-800/30 border border-purple-600/40 rounded-lg shadow-inner`}>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} leading-relaxed`}>
                        <span className="text-purple-400 font-bold">🎧 Note:</span> Music plays continuously and randomly.
                        For best experience, use headphones and allow audio permissions.
                      </p>
                    </div>

                    <div className={`mt-3 ${isMobile ? 'p-1.5' : 'p-2'} text-center bg-gray-900/40 rounded-lg border border-gray-600/30`}>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-300 italic font-medium`}>
                        ✨ Pro tip: Combine sliders with music for amazing audio-reactive effects!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Controls Tab Content */
                <div className={`${isMobile ? 'space-y-2' : 'space-y-3'} overflow-y-auto ${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}>

              {/* Effect Controls */}
              <Card className="bg-gradient-to-br from-black/90 to-gray-900/80 border-gray-500/50 ui-card shadow-lg">
                <CardContent className={`${isMobile ? 'p-3' : 'p-4'} space-y-4`}>
                  <div className="space-y-3">
                    <div>
                      <label
                        className="text-white text-sm luminari block mb-1"
                        style={{ color: shuKnob > 0.1 ? "#ff8000" : "#ffffff" }}
                      >
                        术
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="4"
                        step="0.1"
                        value={shuKnob}
                        onChange={(e) => setShuKnob(Number.parseFloat(e.target.value))}
                        className="w-full ui-slider"
                        style={{ accentColor: shuKnob > 0.1 ? "#ff8000" : "#666666" }}
                      />
                    </div>

                    <div>
                      <label
                        className="text-white text-sm luminari block mb-1"
                        style={{ color: phiKnob > 0.1 ? "#00ff00" : "#ffffff" }}
                      >
                        ф
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={phiKnob}
                        onChange={(e) => setPhiKnob(Number.parseFloat(e.target.value))}
                        className="w-full ui-slider"
                        style={{ accentColor: phiKnob > 0.1 ? "#00ff00" : "#666666" }}
                      />
                    </div>

                    <div>
                      <label
                        className="text-white text-sm luminari block mb-1"
                        style={{ color: getThetaColor(thetaKnob) }}
                      >
                        Θ
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={thetaKnob}
                        onChange={(e) => setThetaKnob(Number.parseFloat(e.target.value))}
                        className="w-full ui-slider"
                        style={{ accentColor: getThetaColor(thetaKnob) }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      size="sm"
                      className={`${
                        isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                      } text-white ui-button`}
                    >
                      iΘ þн
                    </Button>

                    <Button
                      onClick={() => setColoredBackground(!coloredBackground)}
                      size="sm"
                      className={`${
                        coloredBackground ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"
                      } text-white ui-button flex items-center justify-center p-2`}
                    >
                      <img src="/ranga/images/song-inside-logo.png" alt="Logo" className="h-4 w-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoadingComplete && <LoadingProgress />}
      <Canvas
        camera={{ position: [cameraX, cameraY, cameraZ], fov: 50 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.15} />
        {/* Subtle directional light to make the Ranga model visible */}
        <directionalLight
          position={[statueX + 4, statueY + 6, statueZ + 3]}
          intensity={0.25}
          color="#f5f5dc"
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          target={[targetX, targetY, targetZ]}
        />
        <LoadingCameraAnimation
          onComplete={() => setIsLoadingComplete(true)}
          cameraX={cameraX}
          cameraY={cameraY}
          cameraZ={cameraZ}
          targetX={targetX}
          targetY={targetY}
          targetZ={targetZ}
        />
        {isLoadingComplete && (
          <Suspense fallback={null}>
            <RangaModel
              audioData={{
                ...audioData,
                bassLevel: audioData.bassLevel * bassReactivity,
                midLevel: audioData.midLevel * midReactivity,
                trebleLevel: audioData.trebleLevel * trebleReactivity,
              }}
              morphingEffect={morphingEffect}
              bulgeEffect={thetaKnob}
              noiseDistortion={noiseDistortion}
              waveDistortion={waveDistortion}
              rangaLightEmission={rangaLightEmission}
              statueX={statueX}
              statueY={statueY}
              statueZ={statueZ}
              lightPositions={[targetPosition]}
              shuKnob={shuKnob}
              onModelLoaded={() => setModelLoaded(true)}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={0}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier * lightOrbitSpeed}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={1}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier * lightOrbitSpeed}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={2}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier * lightOrbitSpeed}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <ClickHandler
              onPositionLock={handlePositionLock}
              isLocked={isPositionLocked}
              lightDistance={lightDistance}
            />
            <MouseTracker onMouseMove={handleMouseMove} isActive={!isPositionLocked} lightDistance={lightDistance} />
            <DynamicBackground isMobile={isMobile} wizardMode={wizardMode} coloredBackground={coloredBackground} />
          </Suspense>
        )}
      </Canvas>
      {HelpModal()}

    </div>
  )
}
