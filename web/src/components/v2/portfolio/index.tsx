"use client";

import { useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import PortfolioHeader from "./portfolioHeader";
import PortfolioTabs from "./portfolioTabs";

export default function PortfolioPage() {
  const account = useAppKitAccount();
  const resetPortfolio = usePortfolioStore((s) => s.reset);

  useEffect(() => {
    if (!account.isConnected) resetPortfolio();
  }, [account.isConnected, resetPortfolio]);

  return (
    <div className="flex flex-1 justify-center w-full min-w-0">
      <div className="flex-1 min-w-0 flex flex-col gap-[16px] p-4 max-w-screen-xl">
        <PortfolioHeader />
        <PortfolioTabs />
      </div>
    </div>
  );
}
