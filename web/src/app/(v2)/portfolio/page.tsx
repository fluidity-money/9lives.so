import PortfolioBody from "@/components/portfolio/portfolioBody";
import PortfolioHeader from "@/components/portfolio/portfolioHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | 9lives",
  description: "Track your positions, performance and activity on 9lives.",
};

export default function PortfolioPage() {
  return (
    <section className="flex flex-col gap-5 py-4 md:py-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-neutral-400 uppercase">
          Account
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-2black">
          Portfolio
        </h1>
        <p className="max-w-md text-sm text-neutral-500">
          Track your positions, performance and transaction history.
        </p>
      </div>
      <PortfolioHeader />
      <PortfolioBody />
    </section>
  );
}
