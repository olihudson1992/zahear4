"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, SkipForward, Download, ArrowLeft, Volume2 } from "lucide-react"

// Import the track list
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

function useAudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volumeState, setVolumeState] = useState(0.7)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrackIndexRef = useRef(0)
  const shuffledIndicesRef = useRef<number[]>([])
  const isPlayingRef = useRef(false)

  useEffect(() => { currentTrackIndexRef.current = currentTrackIndex }, [currentTrackIndex])
  useEffect(() => { shuffledIndicesRef.current = shuffledIndices }, [shuffledIndices])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    const indices = Array.from({ length: TRACK_LIST.length }, (_, i) => i)
    setShuffledIndices([...indices].sort(() => Math.random() - 0.5))
  }, [])

  const loadTrack = useCallback((index: number, shouldPlay = false) => {
    if (!audioRef.current || shuffledIndicesRef.current.length === 0) return
    const actualIndex = shuffledIndicesRef.current[index]
    const trackName = TRACK_LIST[actualIndex]
    const url = `https://rangatracks.b-cdn.net/${trackName}`
    audioRef.current.src = url
    audioRef.current.load()
    setCurrentTrackIndex(index)
    currentTrackIndexRef.current = index
    if (shouldPlay) {
      setTimeout(() => {
        audioRef.current?.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }, 100)
    }
  }, [])

  const skipToNext = useCallback(() => {
    if (shuffledIndicesRef.current.length === 0) return
    const nextIndex = (currentTrackIndexRef.current + 1) % shuffledIndicesRef.current.length
    loadTrack(nextIndex, isPlayingRef.current)
  }, [loadTrack])

  useEffect(() => {
    if (shuffledIndices.length === 0) return

    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.volume = volumeState
    audioRef.current = audio

    audio.addEventListener("ended", skipToNext)
    audio.addEventListener("error", skipToNext)

    loadTrack(0)

    return () => {
      audio.removeEventListener("ended", skipToNext)
      audio.removeEventListener("error", skipToNext)
      audio.pause()
      audioRef.current = null
    }
  }, [shuffledIndices.length])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    if (isPlayingRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => skipToNext())
    }
  }, [skipToNext])

  const getCurrentTrackName = useCallback(() => {
    if (shuffledIndicesRef.current.length === 0) return "Loading..."
    const actualIndex = shuffledIndicesRef.current[currentTrackIndexRef.current]
    return (
      TRACK_LIST[actualIndex]
        ?.replace(/%20/g, " ")
        .replace(/%27/g, "'")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%26/g, "&")
        .replace(/\.mp3$/, "") || "Unknown Track"
    )
  }, [])

  const downloadCurrentTrack = useCallback(() => {
    if (shuffledIndicesRef.current.length === 0) return
    const actualIndex = shuffledIndicesRef.current[currentTrackIndexRef.current]
    const trackName = TRACK_LIST[actualIndex]
    const url = `https://rangatracks.b-cdn.net/${trackName}`
    const link = document.createElement("a")
    link.href = url
    link.download = getCurrentTrackName()
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [getCurrentTrackName])

  return {
    isPlaying,
    togglePlayPause,
    skipToNext,
    getCurrentTrackName,
    downloadCurrentTrack,
    volume: volumeState,
    setVolume,
  }
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.45 ? "#000000" : "#ffffff"
}

interface MusicOnlyModeProps {
  onBack: () => void
}

export default function MusicOnlyMode({ onBack }: MusicOnlyModeProps) {
  const { isPlaying, togglePlayPause, skipToNext, getCurrentTrackName, downloadCurrentTrack, volume, setVolume } =
    useAudioPlayer()
  const [backgroundColor, setBackgroundColor] = useState("#FF6B35")
  const textColor = getContrastColor(backgroundColor)
  const [currentTrackName, setCurrentTrackName] = useState("")

  const colors = [
    "#FF6B35", // Orange
    "#FFD700", // Gold
    "#FF4500", // Red-Orange
    "#FF8C00", // Dark Orange
    "#FFA500", // Orange
    "#FFFF00", // Yellow
    "#FF6347", // Tomato
    "#FF7F50", // Coral
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTrackName(getCurrentTrackName())
    }, 500)
    return () => clearInterval(interval)
  }, [getCurrentTrackName])

  useEffect(() => {
    if (!currentTrackName) return
    const colorIndex = Math.floor(Math.random() * colors.length)
    setBackgroundColor(colors[colorIndex])
  }, [currentTrackName])

  return (
    <div
      className="w-full h-screen flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor }}
    >
      <div className="max-w-2xl mx-auto text-center p-8 relative">
        <Button
          onClick={onBack}
          variant="outline"
          className="absolute top-4 left-4 bg-black/10 border-black/20 hover:bg-black/20 luminari"
          style={{ transform: "translate(-100%, -100%)", color: textColor }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold luminari" style={{ color: textColor }}>Bangas</h1>

          <Card className="bg-black/10 border-black/20 backdrop-blur-sm w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold luminari" style={{ color: textColor }}>Now Playing:</h2>
                <button
                  onClick={downloadCurrentTrack}
                  className="text-lg transition-colors cursor-pointer underline luminari"
                  style={{ color: textColor, textDecorationColor: textColor + "80" }}
                  title="Click to download"
                >
                  {currentTrackName || "Loading..."}
                </button>
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: textColor + "b0" }}>
                  <Download className="w-4 h-4" />
                  <span className="luminari">Click track name to download</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/10 border-black/20 backdrop-blur-sm w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="bg-black/10 hover:bg-black/20 border-black/20 luminari"
                    style={{ color: textColor }}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    <span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
                  </Button>
                  <Button
                    onClick={skipToNext}
                    size="lg"
                    className="bg-black/10 hover:bg-black/20 border-black/20 luminari"
                    style={{ color: textColor }}
                  >
                    <SkipForward className="w-6 h-6" />
                    <span className="ml-2">Next</span>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <Volume2 className="w-5 h-5" style={{ color: textColor + "b0" }} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                    className="w-32 h-2 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${textColor} ${volume * 100}%, ${textColor}33 ${volume * 100}%)`,
                    }}
                  />
                  <span className="text-sm luminari min-w-[3ch]" style={{ color: textColor + "b0" }}>{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm space-y-2 luminari" style={{ color: textColor + "b0" }}>
            <p>24 hours of unrepeated, uninterrupted original music made by Ranga between 2011 and 2017</p>
            <p>
              <a
                href="https://linktr.ee/olranga"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: textColor }}
              >
                linktr.ee/olranga
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
