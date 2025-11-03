"use client";

import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";
import { useActiveAccount } from "thirdweb/react";
import AssetScene from "../user/assetScene";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useEffect } from "react";
import { formatParticipatedCampaign } from "@/utils/format/formatCampaign";

export default function PortfolioBody() {
  const account = useActiveAccount();
  const { data, isLoading: areGroupsLoading } = useParticipatedCampaigns(
    account?.address,
  );
  const participatedCampaigns = data?.map((i) => formatParticipatedCampaign(i));
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
