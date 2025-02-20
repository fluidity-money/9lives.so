import PortfolioBody from "@/components/portfolio/portfolioBody";
import PortfolioHeader from "@/components/portfolio/portfolioHeader";

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-10">
      <PortfolioHeader />
      <PortfolioBody />
    </div>
  );
}
