"use client";

import ClaimedRewardsRow from "./claimedRewardsRow";
import useClaimedRewards from "@/hooks/useClaimedRewards";
import Placeholder from "../tablePlaceholder";
import usePnLOfWonCampaigns from "@/hooks/usePnLOfWonCampaigns";
import { ClaimedCampaign } from "@/types";
import { useAppKitAccount } from "@reown/appkit/react";
import Button from "../themed/button";
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
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useClaimedRewards(account?.address, campaignId);
  const claimedRewards = data?.pages?.flatMap((p) => p);
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
        <ClaimedRewardsRow key={item.txHash + item.winner} data={item} />
      ))}
      <tr>
        <td colSpan={6}>
          <div className="flex items-center justify-center">
            {hasNextPage ? (
              <Button
                intent={"cta"}
                disabled={isFetchingNextPage}
                title={isFetchingNextPage ? "Loading" : "Show More"}
                onClick={() => fetchNextPage()}
              />
            ) : (
              <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
                End of results
              </span>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
