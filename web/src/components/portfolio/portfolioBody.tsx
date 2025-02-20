"use client";

import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";
import { useActiveAccount } from "thirdweb/react";
import AssetScene from "../user/assetScene";
import { PositionsProps } from "@/types";

export default function PortfolioBody() {
  const account = useActiveAccount();
  const { data: participatedCampaigns, isLoading: areGroupsLoading } =
    useParticipatedCampaigns(account?.address);
  const positionGrops =
    participatedCampaigns?.map(
      (pc) =>
        ({
          campaignName: pc?.content?.name,
          tradingAddr: pc?.content?.poolAddress,
          outcomes: pc?.content?.outcomes,
        }) as PositionsProps,
    ) ?? [];
  return (
    <AssetScene
      positionGrops={positionGrops}
      areGroupsLoading={areGroupsLoading}
    />
  );
}
