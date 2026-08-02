import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import BranchSelectButton from "@/components/BranchSelectButton";
import Hero3DSando from "@/components/Hero3DSando";

// Server Component fetching real database records
export default async function Home() {
  // 1. Fetch active branches
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // 2. Fetch The Sando item details
  const sandoItem = await prisma.menuItem.findFirst({
    where: {
      name: { contains: "Sando", mode: "insensitive" },
    },
  });

  // 3. Fetch top 4 fan favourite items (where isSignature or isNew is true)
  const fanFavourites = await prisma.menuItem.findMany({
    where: {
      isActive: true,
      OR: [{ isSignature: true }, { isNew: true }],
    },
    include: {
      category: true,
    },
    take: 4,
    orderBy: [{ isSignature: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-teal-deep text-cream flex flex-col font-work selection:bg-orange selection:text-ink">
      {/* Header with Branch Switcher */}
      <Header initialBranches={branches} />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. 3D INTERACTIVE HERO SECTION */}
        <Hero3DSando sandoMenuItem={sandoItem} />

        {/* 2. SCROLLING MARQUEE TICKER */}
        <Marquee />

        {/* 3. FAN FAVOURITES SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream/15 pb-6">
            <div>
              <span className="font-mono text-xs text-orange uppercase tracking-widest font-bold">
                Customer Top Picks
              </span>
              <h2 className="font-anton text-4xl sm:text-5xl text-cream uppercase tracking-wide">
                Fan Favourites
              </h2>
            </div>
            <Link
              href="/menu"
              className="font-work text-sm text-orange hover:underline flex items-center gap-1 font-medium"
            >
              Explore Full Menu →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fanFavourites.map((item) => (
              <div
                key={item.id}
                className="bg-cream text-ink rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 border border-cream/80 group"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-teal-deep text-cream">
                      {item.category.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.isSignature && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-orange text-ink uppercase">
                          Signature
                        </span>
                      )}
                      {item.isNew && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red text-cream uppercase">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-anton text-2xl text-ink group-hover:text-teal-deep transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-work text-xs text-ink/75 line-clamp-3 leading-relaxed">
                    {item.description || "Freshly prepared to order with signature Seven Sides seasonings."}
                  </p>

                  {/* Heat Gauge Tag */}
                  {item.hasHeatGauge && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono text-red font-semibold bg-red/10 px-2 py-0.5 rounded border border-red/20">
                      <span>🌶️ Heat Gauge Choice</span>
                    </div>
                  )}
                </div>

                {/* Price & Action */}
                <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-4">
                  <span className="font-mono text-xl font-bold text-ink">
                    Rs. {item.price.toLocaleString()}
                  </span>
                  <Link
                    href="/menu"
                    className="px-3.5 py-1.5 bg-ink text-cream group-hover:bg-orange group-hover:text-ink font-anton text-xs uppercase tracking-wider rounded-lg transition-colors"
                  >
                    View Item
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. OUR BRANCHES SECTION */}
        <section id="branches" className="py-16 sm:py-24 px-4 sm:px-8 bg-ink/40 border-t border-cream/10">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="font-mono text-xs text-orange uppercase tracking-widest font-bold">
                Serving Across Lahore
              </span>
              <h2 className="font-anton text-4xl sm:text-5xl text-cream uppercase tracking-wide">
                Our Branches
              </h2>
              <p className="font-work text-sm text-cream/75">
                Select your nearest branch to place an online order for delivery or quick pickup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-cream text-ink rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6 border border-cream/90 hover:border-orange transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-full bg-teal-deep text-orange font-anton text-xl flex items-center justify-center shadow">
                        📍
                      </span>
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-teal-bright/20 text-teal-deep border border-teal-bright/30">
                        Rs. {branch.deliveryFee} Delivery
                      </span>
                    </div>

                    <div>
                      <h3 className="font-anton text-2xl sm:text-3xl text-ink group-hover:text-teal-deep transition-colors">
                        {branch.name}
                      </h3>
                      <p className="font-work text-xs text-ink/75 mt-1 leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-ink/10 font-work text-xs text-ink/80">
                      <p className="flex items-center gap-2">
                        <span className="font-bold">📞 Phone:</span>
                        <a href={`tel:${branch.phone}`} className="font-mono hover:text-teal-deep underline">
                          +{branch.phone}
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-bold">🕒 Hours:</span>
                        <span className="font-mono">{branch.hoursOpen} – {branch.hoursClose}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-bold">🛵 Radius:</span>
                        <span className="font-mono">{branch.deliveryRadiusKm} km coverage</span>
                      </p>
                    </div>
                  </div>

                  <BranchSelectButton branch={branch} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 5. FOOTER SECTION */}
      <Footer branches={branches} />
    </div>
  );
}
