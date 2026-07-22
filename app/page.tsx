// app/page.tsx
export default function HomePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", lineHeight: 1.6, maxWidth: "800px", margin: "0 auto" }}>

      <style>{`
        @keyframes wizard-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .wizard-float { animation: wizard-float 3s ease-in-out infinite; }
        .wizard-bubble { opacity: 0; transform: translateY(4px); transition: opacity 0.2s, transform 0.2s; }
        .wizard-wrap:hover .wizard-bubble { opacity: 1; transform: translateY(0px); }

        /* ── Social link buttons ── */
        .social-btn {
          position: fixed;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-radius: 14px;
          text-decoration: none;
          color: #00d4ff;
          background: rgba(0,170,255,0.10);
          border: 1.5px solid rgba(0,210,255,0.38);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          white-space: nowrap;
          box-shadow: 0 0 22px rgba(0,210,255,0.28), inset 0 0 10px rgba(0,210,255,0.06);
          font-family: system-ui, -apple-system, sans-serif;
          z-index: 50;
          will-change: transform;
          transition: box-shadow 0.2s, background 0.2s;
        }
        .social-btn:hover {
          box-shadow: 0 0 44px rgba(0,220,255,0.70), inset 0 0 18px rgba(0,220,255,0.16);
          background: rgba(0,170,255,0.22);
        }
        @media (max-width: 900px) { .social-btn { display: none; } }

        /* Each button gets a unique Lissajous-ish 3-D dance */
        @keyframes dance-yt {
          0%   { transform: translate(  0px,   0px) perspective(600px) rotateY(-8deg)  rotateX( 4deg) scale(1.00); }
          18%  { transform: translate( 42px, -32px) perspective(600px) rotateY(15deg)  rotateX(-6deg) scale(1.06); }
          35%  { transform: translate(-18px, -50px) perspective(600px) rotateY( 7deg)  rotateX( 9deg) scale(0.96); }
          52%  { transform: translate( 58px, -20px) perspective(600px) rotateY(-13deg) rotateX(-4deg) scale(1.08); }
          68%  { transform: translate( 12px, -58px) perspective(600px) rotateY(19deg)  rotateX( 7deg) scale(0.95); }
          84%  { transform: translate(-38px, -28px) perspective(600px) rotateY(-5deg)  rotateX(-8deg) scale(1.04); }
          100% { transform: translate(  0px,   0px) perspective(600px) rotateY(-8deg)  rotateX( 4deg) scale(1.00); }
        }
        @keyframes dance-bc {
          0%   { transform: translate(  0px,   0px) perspective(600px) rotateY(10deg)  rotateX(-5deg) scale(1.02); }
          22%  { transform: translate(-45px, -25px) perspective(600px) rotateY(-9deg)  rotateX( 8deg) scale(0.95); }
          40%  { transform: translate( 30px, -52px) perspective(600px) rotateY(17deg)  rotateX(-3deg) scale(1.07); }
          58%  { transform: translate(-22px, -15px) perspective(600px) rotateY(-16deg) rotateX( 5deg) scale(0.97); }
          75%  { transform: translate( 50px, -44px) perspective(600px) rotateY( 8deg)  rotateX(-9deg) scale(1.05); }
          90%  { transform: translate( -8px, -35px) perspective(600px) rotateY(-4deg)  rotateX( 3deg) scale(0.98); }
          100% { transform: translate(  0px,   0px) perspective(600px) rotateY(10deg)  rotateX(-5deg) scale(1.02); }
        }
        @keyframes dance-ls {
          0%   { transform: translate(  0px,   0px) perspective(600px) rotateY(-6deg)  rotateX( 3deg) scale(0.98); }
          20%  { transform: translate( 35px, -42px) perspective(600px) rotateY( 9deg)  rotateX(-6deg) scale(1.05); }
          42%  { transform: translate(-50px, -18px) perspective(600px) rotateY(-14deg) rotateX( 7deg) scale(0.96); }
          60%  { transform: translate( 20px, -60px) perspective(600px) rotateY( 5deg)  rotateX(-4deg) scale(1.07); }
          78%  { transform: translate(-28px, -30px) perspective(600px) rotateY(-11deg) rotateX( 8deg) scale(0.94); }
          92%  { transform: translate( 44px, -10px) perspective(600px) rotateY( 3deg)  rotateX(-2deg) scale(1.02); }
          100% { transform: translate(  0px,   0px) perspective(600px) rotateY(-6deg)  rotateX( 3deg) scale(0.98); }
        }

        .social-yt { right: 60px; top: 18%; animation: dance-yt 5.4s ease-in-out infinite; }
        .social-bc { right: 80px; top: 46%; animation: dance-bc 6.1s ease-in-out infinite 0.9s; }
        .social-ls { right: 55px; top: 70%; animation: dance-ls 4.8s ease-in-out infinite 1.7s; }
      `}</style>

      {/* Social links – dancing in 3-D CSS perspective */}
      <a href="https://www.youtube.com/@Wyrdliverpool" className="social-btn social-yt" target="_blank" rel="noopener noreferrer">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.3 3.5-6.3 3.5z"/>
        </svg>
        YouTube
      </a>

      <a href="https://wyrdliverpool.bandcamp.com" className="social-btn social-bc" target="_blank" rel="noopener noreferrer">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z"/>
        </svg>
        Bandcamp
      </a>

      <a href="/listen" className="social-btn social-ls">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
        Listen
      </a>

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
