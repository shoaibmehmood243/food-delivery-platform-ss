import React from "react";

interface BranchInfo {
  id: string;
  name: string;
  address: string;
}

interface FooterProps {
  branches?: BranchInfo[];
}

const DEFAULT_BRANCHES: BranchInfo[] = [
  { id: "dha", name: "DHA Phase 5", address: "15-A Street 2, Sector A, Phase 5, DHA, Lahore" },
  { id: "lake", name: "Lake City", address: "Lake City, Lahore" },
  { id: "cantt", name: "Cantt", address: "Girja Chowk, Bagh Ali Road, Cantt, Lahore" },
];

export default function Footer({ branches }: FooterProps) {
  const branchList = branches && branches.length > 0 ? branches : DEFAULT_BRANCHES;

  return (
    <footer className="bg-ink text-cream border-t border-cream/10 pt-16 pb-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-cream/10">
        {/* Brand & About */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="font-anton text-2xl text-orange tracking-wide uppercase">
              Seven Sides
            </span>
          </div>
          <p className="font-work text-xs text-cream/70 leading-relaxed">
            Not just a sandwich. It&apos;s a vibe. Serving Lahore&apos;s finest hot chicken tenders, crispy sliders, signature shakes, and treat toasties.
          </p>
        </div>

        {/* Branch Locations */}
        <div className="space-y-3">
          <h4 className="font-anton text-lg text-orange uppercase tracking-wider">
            Locations
          </h4>
          <ul className="space-y-2 font-work text-xs text-cream/75">
            {branchList.map((b) => (
              <li key={b.id}>
                <strong className="text-cream">{b.name}:</strong> {b.address}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Hours */}
        <div className="space-y-3">
          <h4 className="font-anton text-lg text-orange uppercase tracking-wider">
            Opening Hours &amp; Contact
          </h4>
          <div className="space-y-1.5 font-work text-xs text-cream/75">
            <p>⏰ Open Daily: <span className="font-mono text-cream">12:00 PM – 12:00 AM</span></p>
            <p>📞 DHA / Lake City: <span className="font-mono text-cream">+92 319 6481040</span></p>
            <p>📞 Cantt Branch: <span className="font-mono text-cream">+92 322 7694926</span></p>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h4 className="font-anton text-lg text-orange uppercase tracking-wider">
            Follow The Vibe
          </h4>
          <div className="flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-cream/10 hover:bg-orange hover:text-ink text-cream text-xs font-mono rounded transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-cream/10 hover:bg-orange hover:text-ink text-cream text-xs font-mono rounded transition-colors"
            >
              TikTok
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-cream/10 hover:bg-orange hover:text-ink text-cream text-xs font-mono rounded transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/50 font-work gap-4">
        <p>© {new Date().getFullYear()} Seven Sides. All rights reserved.</p>
        <p className="font-mono text-[11px]">Designed &amp; Crafted with 🔥 for Lahore</p>
      </div>
    </footer>
  );
}
