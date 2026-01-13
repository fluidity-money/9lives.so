"use client";

import ClaimedRewardsRow from "./claimedRewardsRow";
import useClaimedRewards from "@/hooks/useClaimedRewards";
import Placeholder from "../tablePlaceholder";
import usePnLOfWonCampaigns from "@/hooks/usePnLOfWonCampaigns";
import { ClaimedCampaign } from "@/types";
import { useAppKitAccount } from "@reown/appkit/react";
const bodyStyles = "min-h-24 bg-9gray";

export default function ClaimedRewardsBody({
  campaignId,
}: {
  campaignId?: string;
}) {
  const account = useAppKitAccount();
  const {
    isLoading,
    isError,
    error,
    data: claimedRewards,
  } = useClaimedRewards(account?.address, campaignId);
  const { data: PnLs } = usePnLOfWonCampaigns(account?.address);
  const enrichedCampaigns = claimedRewards?.map((i) => ({
    ...i,
    PnL: PnLs?.find((pi) => pi?.winner === i?.winner?.slice(2))?.profit,
  })) as (ClaimedCampaign & { PnL?: number })[] | undefined;

  if (isLoading)
    return (
      <tbody className={bodyStyles}>
        <Placeholder title="Loading..." />
      </tbody>
    );
  if (isError)
    return (
      <tbody className={bodyStyles}>
        <Placeholder title="Whoops, error!" subtitle={error.message} />
      </tbody>
    );
  if (claimedRewards?.length === 0)
    return (
      <tbody className={bodyStyles}>
        <Placeholder
          title="No Rewards Yet."
          subtitle="Start Growing Your Portfolio."
        />
      </tbody>
    );

  return (
    <tbody className={bodyStyles}>
      {enrichedCampaigns?.map((item) => (
        <ClaimedRewardsRow
          key={`${item?.winner}${item.createdAt}`}
          data={item}
        />
      ))}
    </tbody>
  );
}
