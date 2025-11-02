"use client";

import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";
import { useActiveAccount } from "thirdweb/react";
import AssetScene from "../user/assetScene";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useEffect } from "react";

export default function PortfolioBody() {
  const account = useActiveAccount();
  const { data: participatedCampaigns, isLoading: areGroupsLoading } =
    useParticipatedCampaigns(account?.address);
  const reset = usePortfolioStore((s) => s.reset);
  useEffect(() => {
    if (!account) reset();
  }, [account, reset]);

  return (
    <AssetScene
      positionGroups={participatedCampaigns}
      areGroupsLoading={areGroupsLoading}
      isDetailDpm={null}
    />
  );
}
