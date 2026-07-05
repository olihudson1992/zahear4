import type { Album } from "./albums"

export const listenAlbums: Album[] = [
  {
    id: "listen",
    title: "listen",
    theme: {
      base: "#030c16",
      ink: "#e8f6ff",
      mutedInk: "rgba(232,246,255,0.6)",
      nodes: ["#38bdf8", "#f97316", "#7dd3fc", "#ea580c", "#0ea5e9", "#fb923c", "#bae6fd"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      // Wyrt URL not yet provided — update when available
      { url: "", name: "Wyrt" },
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
]
