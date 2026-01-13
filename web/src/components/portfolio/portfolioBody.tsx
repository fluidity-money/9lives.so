"use client";

import AssetScene from "../user/assetScene";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";

export default function PortfolioBody() {
  const account = useAppKitAccount();
  const reset = usePortfolioStore((s) => s.reset);
  useEffect(() => {
    if (!account.isConnected) reset();
  }, [account.isConnected, reset]);

  return <AssetScene />;
}
