import type { Album } from "./albums"

export const listenAlbums: Album[] = [
  {
    id: "listen",
    title: "algernon drone demos",
    theme: {
      base: "#030c16",
      ink: "#e8f6ff",
      mutedInk: "rgba(232,246,255,0.6)",
      nodes: ["#38bdf8", "#f97316", "#7dd3fc", "#ea580c", "#0ea5e9", "#fb923c", "#bae6fd"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/Wyrt.mp3", name: "Wyrt" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/HIPTAMINE.mp3", name: "Hiptamine" },
      { url: "https://rangatracks.b-cdn.net/dogs%20tung_ranga_bangas.mp3", name: "Dogs Tongue" },
      { url: "https://rangatracks.b-cdn.net/Dreams%20On%20Contentment%20.mp3", name: "Dreams On Contentment" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/Thirst_Ranga.mp3", name: "Thirst" },
      { url: "https://rangatracks.b-cdn.net/lgno_ranga.mp3", name: "Igno" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/past%20life_ol'.mp3", name: "Past Life" },
      { url: "https://rangatracks.b-cdn.net/WYRD%20TIMES/Fox%20-%20Wyrd.mp3", name: "Wyrd" },
      { url: "https://rangatracks.b-cdn.net/White%20Peony_Ranga.mp3", name: "White Peony" },
      { url: "https://rangatracks.b-cdn.net/180%20gram_ranga_bangas.mp3", name: "180 Gram" },
      // Fossil Road URL not yet provided — update when available
      { url: "", name: "Fossil Road" },
      { url: "https://rangatracks.b-cdn.net/fosil%20road/god2_Ol'.mp3", name: "God 2" },
    ],
  },
  {
    id: "latest",
    title: "latest",
    theme: {
      base: "#050d08",
      ink: "#edfff4",
      mutedInk: "rgba(237,255,244,0.6)",
      nodes: ["#6ee7b7", "#34d399", "#a7f3d0", "#10b981", "#d1fae5", "#059669", "#ecfdf5"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/DEMOS/have%20it%20mate.mp3", name: "Have It Mate" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/rowan.mp3",            name: "Rowan" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Terrano%20.mp3",      name: "Terrano" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Tresa%20.mp3",        name: "Tresa" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/oremus.mp3",    name: "Oremus" },
    ],
  },
]
