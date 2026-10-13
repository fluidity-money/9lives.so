"use client";

import { usePortfolioStore } from "@/stores/portfolioStore";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import PortfolioTabs from "./portfolioTabs";

export default function PortfolioBody() {
  const account = useAppKitAccount();
  const reset = usePortfolioStore((state) => state.reset);

  useEffect(() => {
    if (!account.isConnected) reset();
  }, [account.isConnected, reset]);

  return <PortfolioTabs />;
}
