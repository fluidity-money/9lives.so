"use client";

import { useActiveAccount } from "thirdweb/react";
import AssetScene from "../user/assetScene";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useEffect } from "react";

export default function PortfolioBody() {
  const account = useActiveAccount();
  const reset = usePortfolioStore((s) => s.reset);
  useEffect(() => {
    if (!account) reset();
  }, [account, reset]);

  return <AssetScene />;
}
