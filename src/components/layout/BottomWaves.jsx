/**
 * BottomWaves — the single, global signature ending for every LivPath AI page.
 *
 * One compact organic wave landscape (pale teal -> teal -> deep navy) that
 * flows seamlessly into one minimal footer. There are no variants: every page
 * gets this exact composition through the layout wrapper. Do not render this
 * component again inside a page.
 */
export default function BottomWaves() {
  return (
    <footer className="relative w-full overflow-hidden mt-auto pointer-events-none">
      {/* One layered wave landscape */}
      <div className="relative w-full h-[110px] sm:h-[140px] md:h-[170px]">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 170"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle dotted journey path drifting behind the waves */}
          <g className="footer-drift" opacity="0.35">
            <path
              d="M-80,54 C300,24 520,92 900,52 S1320,78 1560,44"
              fill="none"
              stroke="#0F766E"
              strokeWidth="2"
              strokeDasharray="4 10"
              strokeLinecap="round"
            />
            <circle className="footer-node" cx="420" cy="60" r="4" fill="#F59E0B" />
            <circle className="footer-node" cx="980" cy="52" r="3.5" fill="#0F766E" style={{ animationDelay: '1.5s' }} />
          </g>

          {/* Layer 1 — pale atmospheric transition */}
          <path
            d="M0,78 C240,22 480,118 720,80 C960,44 1200,112 1440,72 L1440,170 L0,170 Z"
            fill="#0F766E"
            fillOpacity="0.10"
          />
          {/* Layer 2 — primary teal, organic and asymmetrical */}
          <path
            d="M0,112 C260,58 520,140 780,110 C1040,82 1240,132 1440,100 L1440,170 L0,170 Z"
            fill="#0F766E"
            fillOpacity="0.45"
          />
          {/* Layer 3 — deep navy, transitions straight into the footer */}
          <path
            d="M0,142 C300,104 600,160 900,132 C1140,110 1320,146 1440,126 L1440,170 L0,170 Z"
            fill="#12355B"
          />
        </svg>
      </div>

      {/* One minimal footer — seamless navy continuation of the last wave */}
      <div className="relative z-10 -mt-px flex flex-col items-center gap-4 bg-[#12355B] px-6 pt-2 pb-9 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[18px]">route</span>
            </span>
            <span className="text-headline-md font-headline-md font-extrabold tracking-tight text-white">
              LivPath AI
            </span>
          </span>
          <p className="font-body-md text-label-md text-white/55">Your journey, guided.</p>
        </div>

        <nav className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-label-md text-label-md text-white/75">
          <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
          <span className="text-white/20">·</span>
          <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
          <span className="text-white/20">·</span>
          <a href="#" className="transition-colors hover:text-white">Support</a>
        </nav>

        <p className="font-label-sm text-label-sm text-white/40">© 2026 LivPath AI</p>
      </div>
    </footer>
  );
}
