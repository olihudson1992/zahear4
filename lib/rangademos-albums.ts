import type { Album } from "./albums"

// Three unknown track URLs below (rowan, fortune, pultiare) are best guesses —
// update if the CDN paths differ.
export const rangaDemosAlbums: Album[] = [
  {
    id: "wen",
    title: "wen",
    description: "A selection of tracks from the Ranga & Mwamwa universe.",
    theme: {
      base: "#040d14",
      ink: "#e8f8ff",
      mutedInk: "rgba(232,248,255,0.6)",
      nodes: ["#38b2d8", "#f97316", "#7ec8e3", "#fb923c", "#bae6fd", "#0ea5d8", "#fed7aa"],
      display: "font-display font-light tracking-wide",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/DEMOS/rowan.mp3",                                name: "Rowan" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/Ranga%20-%20Ol'%20-%20Fortune%20.mp3",    name: "Fortune" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/oremus.mp3",                        name: "Oremus" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/gongs%20july%20mix.mp3",                   name: "Gongs" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/hang%20on%20-%20oli.mp3",                  name: "Hang On" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/Ranga%20-%20Ol'%20-%20Pultire.mp3",        name: "Pultiare" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Terrano%20.mp3",                          name: "Terrano" },
      { url: "https://rangatracks.b-cdn.net/DEMOS/Ranga%20-%20Ol'%20-%20Mamaliga.mp3",       name: "Mamaliga" },
    ],
  },
  {
    id: "mwamwa-ranga",
    title: "mwamwa & ranga",
    description: "A collaboration between Ranga and Mexico City artist",
    descriptionLink: { label: "Mwamwa", url: "https://mwamwa.bandcamp.com" },
    theme: {
      base: "#080412",
      ink: "#f0e8ff",
      mutedInk: "rgba(240,232,255,0.6)",
      nodes: ["#a855f7", "#7c3aed", "#c084fc", "#6d28d9", "#e9d5ff", "#9333ea", "#4c1d95"],
      display: "font-display font-normal tracking-tight",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/mwamwa/Terrano%20.mp3",                            name: "Terrano" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Tresa%20.mp3",                              name: "Tresa" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/168%20JULIANO%20REMIX%20INSTRUMENTAL.mp3",  name: "Juliano Remix" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Gongs.mp3",     name: "Gongs" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Tides.mp3",     name: "Tides" },
      { url: "https://rangatracks.b-cdn.net/mwamwa/Ranga%20%26%20Mwamwa%20-%20Banga.mp3",     name: "Banga" },
    ],
  },
  {
    id: "solstice",
    title: "solstice",
    description: "Folk-tronica and jazz from the midsummer sessions.",
    theme: {
      base: "#0e0c00",
      ink: "#fefce8",
      mutedInk: "rgba(254,252,232,0.6)",
      nodes: ["#fbbf24", "#e2e8f0", "#fde047", "#f1f5f9", "#fef3c7", "#facc15", "#94a3b8"],
      display: "font-display font-light tracking-widest",
    },
    tracks: [
      { url: "https://rangatracks.b-cdn.net/mid%20summer/easy%20ft%20james%20morrigan.mp3", name: "Easy ft James Morrigan" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/enchelader.mp3",                   name: "Enchelader", gain: 1 },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/jacks%20reel.mp3",                 name: "Jacks Reel" },
      { url: "https://rangatracks.b-cdn.net/mid%20summer/solstice.mp3",                     name: "Solstice" },
    ],
  },
]
