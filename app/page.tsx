export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-cream flex flex-col items-center justify-center p-6 selection:bg-orange selection:text-ink">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Brand Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-teal-deep text-orange border border-teal-bright text-sm font-mono tracking-wider uppercase font-semibold">
          Phase 0 Scaffold Active
        </div>

        {/* Main Heading styled with Anton Display Font */}
        <h1 className="font-anton text-5xl sm:text-7xl tracking-wider text-cream uppercase drop-shadow-md">
          Seven Sides — coming soon
        </h1>

        {/* Subtext styled with Work Sans */}
        <p className="font-work text-lg sm:text-xl text-cream/80 max-w-md mx-auto leading-relaxed">
          Not just a sandwich. It&apos;s a vibe.
        </p>

        {/* Color Swatches Grid to verify Tailwind Custom Colors */}
        <div className="pt-6">
          <p className="font-mono text-xs text-cream/50 uppercase tracking-widest mb-4">
            Tailwind Theme Verification Palette
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-ink rounded border border-cream/30 mb-2"></div>
              <span className="font-mono text-xs block text-cream">ink</span>
              <span className="font-mono text-[10px] text-cream/60">#141414</span>
            </div>
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-cream rounded mb-2"></div>
              <span className="font-mono text-xs block text-cream">cream</span>
              <span className="font-mono text-[10px] text-cream/60">#FFF7EA</span>
            </div>
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-teal-deep rounded mb-2"></div>
              <span className="font-mono text-xs block text-cream">teal-deep</span>
              <span className="font-mono text-[10px] text-cream/60">#0B4F4C</span>
            </div>
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-teal-bright rounded mb-2"></div>
              <span className="font-mono text-xs block text-cream">teal-bright</span>
              <span className="font-mono text-[10px] text-cream/60">#1E8C86</span>
            </div>
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-orange rounded mb-2"></div>
              <span className="font-mono text-xs block text-cream">orange</span>
              <span className="font-mono text-[10px] text-cream/60">#F5A623</span>
            </div>
            <div className="bg-ink p-3 rounded border border-cream/20 text-center">
              <div className="w-full h-8 bg-red rounded mb-2"></div>
              <span className="font-mono text-xs block text-cream">red</span>
              <span className="font-mono text-[10px] text-cream/60">#E2402F</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
