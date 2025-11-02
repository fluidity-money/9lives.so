"use client";

import { useActiveAccount } from "thirdweb/react";
import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import PositionRow from "./positionRow";
import usePositionHistory from "@/hooks/usePositionsHistory";
import Placeholder from "../tablePlaceholder";
import { Outcome, ParticipatedCampaign } from "@/types";

export default function PositionsGroup({
  campaignId,
  content,
  outcomeIds,
  detailPage,
  colSpan,
  hideSmallBalances,
}: ParticipatedCampaign & {
  content: NonNullable<ParticipatedCampaign["content"]>;
  detailPage?: boolean;
  colSpan: number;
  hideSmallBalances: boolean;
}) {
  const account = useActiveAccount();
  const {
    isLoading,
    isError,
    error,
    data: positions,
  } = usePositions({
    tradingAddr: content.poolAddress as `0x${string}`,
    outcomes: content.outcomes as Outcome[],
    account,
    isDpm: content?.isDpm,
  });
  const { data: sharePrices } = useSharePrices({
    tradingAddr: content.poolAddress as `0x${string}`,
    outcomeIds: outcomeIds as `0x${string}`[],
  });
  const { data: positionsHistory } = usePositionHistory(
    account?.address,
    positions?.map((p) => p.id),
  );

  if (isLoading)
    return (
      <Placeholder
        colSpan={colSpan}
        title="Loading..."
        height={!detailPage ? "min-h-20" : undefined}
      />
    );
  if (isError)
    return (
      <Placeholder
        colSpan={colSpan}
        title="Whoops, error!"
        subtitle={error.message}
        height={!detailPage ? "min-h-20" : undefined}
      />
    );
  if (detailPage && positions?.length === 0)
    return (
      <Placeholder
        colSpan={colSpan}
        title="Nothing yet."
        subtitle="Start Growing Your Portfolio."
      />
    );
  return positions
    ?.filter((f) => !(hideSmallBalances && BigInt(1e4) >= f.balanceRaw))
    .map((item, idx) => (
      <PositionRow
        key={idx}
        campaignContent={content}
        data={{
          ...item,
          campaignName: content.name,
          campaignId: campaignId as `0x${string}`,
          winner: content.winner,
        }}
        price={sharePrices?.find((o) => o.id === item.id)?.price}
        history={positionsHistory?.filter((p) => p.id === item.id)}
        detailPage={detailPage}
      />
    ));
}
