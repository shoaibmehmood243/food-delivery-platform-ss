import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClientContent from "@/components/CheckoutClientContent";

export const metadata = {
  title: "Checkout — Seven Sides",
  description: "Complete your hot chicken order for delivery or pickup in Lahore.",
};

export default async function CheckoutPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-teal-deep text-cream flex flex-col font-work selection:bg-orange selection:text-ink">
      <Header initialBranches={branches} />

      <main className="flex-1">
        <CheckoutClientContent branches={branches} />
      </main>

      <Footer branches={branches} />
    </div>
  );
}
