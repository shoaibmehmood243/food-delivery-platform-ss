import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuClientContent from "@/components/MenuClientContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Menu — Seven Sides",
  description:
    "Explore Seven Sides full menu of hot chicken sandos, crispy tenders, wraps, sliders, waffle fries, hand spun shakes, and treats.",
};

export default async function MenuPage() {
  // Fetch active branches for Header switcher
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch categories & active menu items with addon options
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: {
        where: { isActive: true },
        include: {
          addonOptions: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-teal-deep text-cream flex flex-col font-work selection:bg-orange selection:text-ink">
      {/* Sticky Top Header */}
      <Header initialBranches={branches} />

      {/* Hero Banner for Menu */}
      <section className="bg-ink/40 border-b border-cream/10 py-10 px-4 sm:px-8 text-center space-y-2">
        <span className="font-mono text-xs text-orange uppercase tracking-widest font-bold">
          Lahore Fresh Daily
        </span>
        <h1 className="font-anton text-4xl sm:text-6xl text-cream uppercase tracking-wide">
          Our Full Menu
        </h1>
        <p className="font-work text-sm text-cream/80 max-w-lg mx-auto">
          Crafted to order with customizable heat levels, house-made sauces, and premium ingredients.
        </p>
      </section>

      {/* Main Menu Layout with Sticky Category Bar */}
      <main className="flex-1 pb-16">
        <MenuClientContent categories={categories} />
      </main>

      {/* Footer */}
      <Footer branches={branches} />
    </div>
  );
}
