export type Track = {
  url: string
  name: string
  gain?: number      // pre-limiter gain multiplier; defaults to 1.0 if omitted
  startTime?: number // seek to this position (seconds) on load, to skip leading silence
  nextUrl?: string   // always play this track URL next, bypassing shuffle
}

export type AlbumTheme = {
  base: string
  ink: string
  mutedInk: string
  nodes: string[]
  display: string
}

export type Album = {
  id: string
  title: string
  art?: string
  theme: AlbumTheme
  tracks: Track[]
  description?: string
  descriptionLink?: { label: string; url: string }
  shape?: "tetrahedron"
}

export const albums: Album[] = [
  {
    id: "rangas-top-tip",
    title: "flowers",
    theme: {
      base: "#0c080e",
      ink: "#f8f0ff",
      mutedInk: "rgba(248,240,255,0.6)",
      nodes: ["#8860c0", "#d4a820", "#a870e0", "#c09018", "#c8a0f0", "#f0cc60", "#502890"],
      display: "font-display italic tracking-wide",
    },
    description: "A selection of Ranga's favourite tracks from across all albums.",
    tracks: [
      { url: "https://rangatracks.b-cdn.net/HOME/ol%20-%20The%20Elephants%20Graveyard.mp3", name: "Elephants Graveyard" },
      { url: "https://rangatracks.b-cdn.net/HOME/pondeavon.mp3", name: "Pon de Avon", gain: 1.2 },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/easy%20ft%20james%20morrigan.mp3", name: "Easy ft James Morrigan" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Terrano%20.mp3", name: "Terrano" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Tresa%20.mp3", name: "Tresa" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/hang%20on%20-%20oli.mp3", name: "Hang On" },
      { url: "https://rangatracks.b-cdn.net/bangas/banga%20one%20-%20ranga%202026.mp3", name: "Banga One" },
      { url: "https://rangatracks.b-cdn.net/pizza/Pizza%20Slice%20140%202.mp3", name: "Pizza Slice 140 2" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Fox%20-%20Wyrd.mp3", name: "Fox - Wyrd" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/god2_Ol'.mp3", name: "God 2" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/center.mp3", name: "center", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/HOME/SONG%20ONE.mp3", name: "Song One" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/Thirst_Ranga.mp3", name: "Thirst" },
    ],
  },
  {
    id: "dada-shanti",
    title: "dada shanti",
    art: "/images/dada-shanti-album.png",
    theme: {
      base: "#080f14",
      ink: "#eaf2ff",
      mutedInk: "rgba(234,242,255,0.6)",
      nodes: ["#2bb6a8", "#1f6f9e", "#e8c46a", "#2f9fd0", "#bfeee4", "#15506b", "#caa14a"],
      display: "font-display italic tracking-wide",
    },
    description: "An album made for MC Dada Shanti in 2017.",
    tracks: [
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/birdy%20dub_ranga%20dada%20shanti.mp3", name: "Birdy Dub" },
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20%20Outbreak.mp3", name: "Outbreak" },
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20Da%20Great%20Crocodile.mp3", name: "Da Great Crocodile" },
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Dada%20Shanti%20-%20Healing%20Dub.mp3", name: "Healing Dub" },
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/dada%20shanti%20plants%202026%20mix%203.mp3", name: "Plants 2026 (mix 3)" },
      { url: "https://rangatracks.b-cdn.net/DADA%20SHANTI%20DEMOS/Godman%20-%20Dada%20Shanti-1.mp3", name: "Godman" },
    ],
  },
  {
    id: "ambient",
    title: "ambient",
    description: "A collection of ambient works for meditation.",
    theme: {
      base: "#0e0c00",
      ink: "#fffde8",
      mutedInk: "rgba(255,253,232,0.6)",
      nodes: ["#f5d60a", "#3b82f6", "#fde047", "#60a5fa", "#fbbf24", "#2563eb", "#fef08a"],
      display: "font-display font-light tracking-widest",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/AMBIENT/center.mp3", name: "center", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/drones%202.mp3", name: "drones 2", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/droney.mp3", name: "droney" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/droney1%20ol%20.mp3", name: "droney 1" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Home%20-%20Ranga.mp3", name: "Home", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/jon_oli.mp3", name: "jon oli", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/NightNight.mp3", name: "Night Night" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Ranga%20-%20Deep%20Meditation.mp3", name: "Deep Meditation", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Ranga%20-%20Past%20Life%20-%2001%20Kilt.mp3", name: "Past Life - Kilt" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Ranga%20Ft%20Sunshine%20Rage%20-%20Beacon%20-%20Beacon%20.mp3", name: "Beacon ft Sunshine Rage" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/song%20inside.mp3", name: "song inside" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/truth%20-%20OLIVER.mp3", name: "truth", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/ultimet.mp3", name: "ultimet" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/TIDE%201%20Oli.mp3", name: "Tide 1", gain: 1.4 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/TIDE%202%20Oli.mp3", name: "Tide 2" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/TINE%20MACHINE%2075%20OL.mp3", name: "Time Machine 75" },
    ],
  },
  {
    id: "orbic",
    title: "orbic",
    description: "An EP made in collab with Jenome.",
    theme: {
      base: "#0e0a14",
      ink: "#ecdeff",
      mutedInk: "rgba(236,222,255,0.6)",
      nodes: ["#7b4fa6", "#a87fd4", "#4a2272", "#c9a8f0", "#3b1a5c", "#9060c0", "#200f36"],
      display: "font-display italic font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Orbic%20Orbic%20-%2012%20Susans.mp3", name: "12 Susans", gain: 2.0 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Orbic%20Orbic%20-%20L().mp3", name: "L()", gain: 1.5, startTime: 41 },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Orbic%20Orbic%20-%20Oorb6.mp3", name: "Oorb6" },
      { url: "https://rangatracks.b-cdn.net/AMBIENT/Orbic%20Orbic%20-%20Orbic.mp3", name: "Orbic" },
    ],
  },
  {
    id: "sanga",
    title: "sanga",
    description: "An album inspired by joining a Sanga.",
    theme: {
      base: "#150800",
      ink: "#fff5e8",
      mutedInk: "rgba(255,245,232,0.6)",
      nodes: ["#f97316", "#e85a00", "#ffa040", "#c44a00", "#ffd0a0", "#d46020", "#8a3000"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/HOME/CLOUD%20BEAT.mp3", name: "Cloud Beat" },
      { url: "https://rangatracks.b-cdn.net/HOME/ol%20-%20The%20Elephants%20Graveyard.mp3", name: "The Elephants Graveyard", nextUrl: "https://rangatracks.b-cdn.net/HOME/pondeavon.mp3" },
      { url: "https://rangatracks.b-cdn.net/HOME/pondeavon.mp3", name: "Pon de Avon", gain: 1.2 },
      { url: "https://rangatracks.b-cdn.net/HOME/SONG%20ONE.mp3", name: "Song One" },
      { url: "https://rangatracks.b-cdn.net/HOME/SONG%20TWO.mp3", name: "Song Two" },
      { url: "https://rangatracks.b-cdn.net/HOME/WAKE%20TWO.mp3", name: "Wake Two" },
      { url: "https://rangatracks.b-cdn.net/HOME/WYRT.mp3", name: "Wyrt" },
    ],
  },
  {
    id: "capoweara-pizza",
    title: "capoweara & pizza",
    description: "Some beats made on hardware.",
    theme: {
      base: "#140a08",
      ink: "#fff0e8",
      mutedInk: "rgba(255,240,232,0.6)",
      nodes: ["#e8603a", "#c04020", "#f0a070", "#a03018", "#ffd0a0", "#d05030", "#601808"],
      display: "font-sans font-bold lowercase tracking-tight",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera%202.mp3", name: "Capowera 2" },
      { url: "https://rangatracks.b-cdn.net/Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera.mp3", name: "Capowera" },
      { url: "https://rangatracks.b-cdn.net/pizza/Pizza%20Slice%20140%202.mp3", name: "Pizza Slice 140 2" },
      { url: "https://rangatracks.b-cdn.net/pizza/Pizza%20Slice%20140.mp3", name: "Pizza Slice 140" },
      { url: "https://rangatracks.b-cdn.net/pizza/Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Sleep%203.mp3", name: "Sleep 3" },
      { url: "https://rangatracks.b-cdn.net/pizza/Ranga%20Pizza%20-%20Pizza%20Slice%201.mp3", name: "Pizza Slice 1" },
      { url: "https://rangatracks.b-cdn.net/pizza/Ranga%20Pizza%20-%20Pizza%20Slice%202.mp3", name: "Pizza Slice 2" },
      { url: "https://rangatracks.b-cdn.net/pizza/Ranga%20Pizza%20-%20Pizza%20Slice%203.mp3", name: "Pizza Slice 3" },
    ],
  },
  {
    id: "rangas",
    title: "rangas",
    description: "Some more beats made on hardware, previously used for a live band.",
    theme: {
      base: "#100808",
      ink: "#ffe8e0",
      mutedInk: "rgba(255,232,224,0.6)",
      nodes: ["#c03820", "#902010", "#e07050", "#601008", "#f0a888", "#a02818", "#380808"],
      display: "font-sans font-black uppercase tracking-tight",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/Beat%201.mp3", name: "Beat 1" },
      { url: "https://rangatracks.b-cdn.net/Beat%202.mp3", name: "Beat 2" },
      { url: "https://rangatracks.b-cdn.net/Beat%207.mp3", name: "Beat 7" },
      { url: "https://rangatracks.b-cdn.net/Beat%209.mp3", name: "Beat 9" },
      { url: "https://rangatracks.b-cdn.net/last%20beat.mp3", name: "Last Beat", gain: 3.0 },
      { url: "https://rangatracks.b-cdn.net/last%20nite%20beat%201.mp3", name: "Last Nite Beat 1" },
      { url: "https://rangatracks.b-cdn.net/last%20nite%20beat%202.mp3", name: "Last Nite Beat 2", gain: 1.2 },
      { url: "https://rangatracks.b-cdn.net/ooo_Ol'%20(beat).mp3", name: "ooo Ol' (beat)", gain: 1.2 },
      { url: "https://rangatracks.b-cdn.net/Ranga%20-%20Beats%20-%20Glass%20Tiger.mp3", name: "Glass Tiger" },
      { url: "https://rangatracks.b-cdn.net/BRANDY%20PT1.mp3", name: "Brandy Pt 1" },
      { url: "https://rangatracks.b-cdn.net/BRANDY%20PT2.mp3", name: "Brandy Pt 2" },
      { url: "https://rangatracks.b-cdn.net/Whomper.mp3", name: "Whomper" },
      { url: "https://rangatracks.b-cdn.net/Stomper.mp3", name: "Stomper" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/HIPTAMINE.mp3", name: "Hiptamine" },
    ],
  },
  {
    id: "midsummer",
    title: "midsummer",
    description: "My latest album, exploring Folk-tronica, Jazz and Dub — inspired from summer 2026.",
    theme: {
      base: "#060e18",
      ink: "#e8f8ff",
      mutedInk: "rgba(232,248,255,0.6)",
      nodes: ["#7ec8e3", "#38b2d8", "#b3e5fc", "#0ea5d8", "#c8eeff", "#2490b8", "#5ac8e8"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/mid%20summer/easy%20ft%20james%20morrigan.mp3", name: "Easy ft James Morrigan" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/enchelader.mp3", name: "Enchelader", gain: 1 },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/jacks%20reel.mp3", name: "Jacks Reel" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/llangolen%20ft%20james%20morrigan.mp3", name: "Llangolen ft James Morrigan" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/oremus.mp3", name: "Oremus" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/solstice.mp3", name: "Solstice" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/iSNty%20instrumentsa.mp3", name: "Isnt" },
    ],
  },
  {
    id: "midwinter",
    title: "midwinter",
    description: "An album made in January 2026, exploring a move away from hardware and recordings of clock parts.",
    theme: {
      base: "#04081a",
      ink: "#dde8ff",
      mutedInk: "rgba(221,232,255,0.6)",
      nodes: ["#1e3a8a", "#2d5be3", "#0f2460", "#4a78f0", "#92b0ff", "#162e6e", "#3058c8"],
      display: "font-display font-light tracking-widest",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/78%20kalimba.mp3", name: "78 Kalimba" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/COURAGE.mp3", name: "Courage", gain: 1.2 },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/gongs.mp3", name: "Gongs" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/hang%20on%20-%20oli.mp3", name: "Hang On" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/MOON%20OLI.mp3", name: "Moon" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/more%20dub%202.mp3", name: "More Dub 2" },
      { url: "https://rangatracks.b-cdn.net/MIDWINTER/STAR%20OLI.mp3", name: "Star", nextUrl: "https://rangatracks.b-cdn.net/MIDWINTER/MOON%20OLI.mp3" },
    ],
  },
  {
    id: "mwamwa",
    title: "mwamwa",
    description: "An EP made in collaboration with Mexico City artist",
    descriptionLink: { label: "Mwamwa", url: "https://mwamwa.bandcamp.com" },
    theme: {
      base: "#100e08",
      ink: "#fff8e0",
      mutedInk: "rgba(255,248,224,0.6)",
      nodes: ["#d4a820", "#a07810", "#f0cc60", "#705808", "#f8e8a0", "#c09018", "#403005"],
      display: "font-display font-normal tracking-tight",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Banga.mp3", name: "Banga" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Gongs.mp3", name: "Gongs" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Tides.mp3", name: "Tides" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Terrano%20.mp3", name: "Terrano" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Tresa%20.mp3", name: "Tresa" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/168%20JULIANO%20REMIX%20INSTRUMENTAL.mp3", name: "Juliano Remix" },
    ],
  },
  {
    id: "wyrd-times",
    title: "wyrd times",
    description: "A collection of dance tracks in weird time signatures.",
    theme: {
      base: "#100810",
      ink: "#f0e0f8",
      mutedInk: "rgba(240,224,248,0.6)",
      nodes: ["#8840a0", "#603080", "#b070d0", "#402060", "#d0a0e8", "#702890", "#200830"],
      display: "font-display italic font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/feast%20remaster.mp3", name: "Feast (remaster)" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Cactus.mp3", name: "Cactus" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/feel_oli.mp3", name: "Feel" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Fox%20-%20Tail.mp3", name: "Fox - Tail" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Fox%20-%20Waiten%20(1).mp3", name: "Waiten" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Fox%20-%20Wyrd.mp3", name: "Fox - Wyrd" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/god2_Ol'.mp3", name: "God 2" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Hide%20140.mp3", name: "Hide 140" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/lid_oli.mp3", name: "Lid" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Oud.mp3", name: "Oud" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/past%20life_ol'.mp3", name: "Past Life" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Ranga%20-%20Anger%20%26%20Happiness%20%20Open.mp3", name: "Anger & Happiness - Open" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Ranga%20-%20Anger%20%26%20Happiness%20%20Purple's%20Flight.mp3", name: "Purple's Flight" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Ranga%20-%20Ol'%20-%207.mp3", name: "Ol' - 7" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Ranga%20-%20Ol'%20-%20Mamaliga.mp3", name: "Mamaliga" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/trip.mp3", name: "Trip" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/have%20it%20mate.mp3", name: "Have It Mate" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/rowan.mp3", name: "Rowan" },
    ],
  },
  {
    id: "foesil-road",
    title: "foesil road",
    description: "An EP made in 2016 inspired by Foesil Road in Cov.",
    theme: {
      base: "#0c100a",
      ink: "#e8f0e0",
      mutedInk: "rgba(232,240,224,0.6)",
      nodes: ["#608840", "#407020", "#90b860", "#285010", "#b8d890", "#507830", "#182808"],
      display: "font-sans font-bold lowercase tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/fosil%20road/Champ_Ol.mp3", name: "Champ" },
      { url: "https://rangatracks.b-cdn.net/fosil%20road/CHOICE.mp3", name: "Choice" },
      { url: "https://rangatracks.b-cdn.net/fosil%20road/FOESIL%20ROAD_oli.mp3", name: "Foesil Road" },
      { url: "https://rangatracks.b-cdn.net/fosil%20road/moozy_oli.mp3", name: "Moozy" },
      { url: "https://rangatracks.b-cdn.net/fosil%20road/vocal_oli.mp3", name: "Vocal" },
    ],
  },
]

export const defaultTheme: AlbumTheme = {
  base: "#0c0c10",
  ink: "#ece9e2",
  mutedInk: "rgba(236,233,226,0.55)",
  nodes: ["#5b6470", "#3a4250", "#7d8694", "#2a3038", "#9aa2ad", "#454d59", "#222831"],
  display: "font-display font-light tracking-tight",
}

export function findAlbum(id: string | null): Album | undefined {
  if (!id) return undefined
  return albums.find((a) => a.id === id)
}
