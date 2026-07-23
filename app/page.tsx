// app/page.tsx
import { SocialButtons } from "@/components/social-buttons"

export default function HomePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", lineHeight: 1.6, maxWidth: "800px", margin: "0 auto" }}>

      <SocialButtons />

      <style>{`
        @keyframes wizard-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .wizard-float { animation: wizard-float 3s ease-in-out infinite; }
        .wizard-bubble { opacity: 0; transform: translateY(4px); transition: opacity 0.2s, transform 0.2s; }
        .wizard-wrap:hover .wizard-bubble { opacity: 1; transform: translateY(0px); }
      `}</style>

      <a href="/everything" className="wizard-wrap" style={{ position: "fixed", bottom: "2rem", right: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", textDecoration: "none", zIndex: 100 }}>
        <div className="wizard-bubble" style={{ background: "white", color: "black", borderRadius: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          wanna see everything?
        </div>
        <div className="wizard-float" style={{ fontSize: "2.5rem", lineHeight: 1 }}>🧙🏻‍♂️</div>
      </a>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.25rem", fontFamily: "Luminari, fantasy" }}>Origin and history of the word weird</h1>

      <p>
        <strong>weird(adj.) from the word &lsquo;Wyrd&rsquo;</strong><br />
        c. 1400, "having power to control fate," in weird sisters, from weird (n.) "force that sets events in motion or determines their course; what is destined to befall one;" from Old English wyrd "fate, chance, fortune; destiny; the Fates." The modern senses developed from weird sisters, not immediately from the Old English word, which is etymologically "that which comes."
      </p>

      <p>
        It is reconstructed to be from Proto-Germanic <em>*wurthiz</em> (source also of Old Saxon wurd, Old High German wurt "fate," Old Norse urðr "fate, one of the three Norns"), itself reconstructed to be from PIE <em>*wert-</em> "to turn, to wind" (source also of German werden, Old English weorðan "to become"), from root <em>*wer- (2)</em> "to turn, bend." For the sense development from "turning" to "becoming," compare colloquial phrase turn into "become."
      </p>

      <p>
        The sense of "uncanny, supernatural" developed from Middle English use of weird sisters for the three Fates, Parcae, or Norns (in Germanic mythology), the goddesses who controlled human destiny. They were portrayed as odd or frightening in appearance, as in "Macbeth" (especially in 18th and 19th century productions).
      </p>

      <p>
        The modern adjectival use, without sisters, emerged early 19c. Todd's supplement to Johnson (1818) has it as "skilled in witchcraft." Shelley was perhaps the first to use it consistently in print as "supernatural, uncanny":
      </p>

      <p>
        As a verb, "change by witchcraft or sorcery." Earlier to be weirded in Middle English was "be foreordained or predestined."
      </p>

      <p>
        Love is weird. Isn&rsquo;t it? It makes us go to the strangest places, make odd decisions, write songs, move countries, leave jobs, and we can&rsquo;t control it.<br />
        Or can we?
      </p>
    </div>
  )
}
