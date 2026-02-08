"use client";

import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import PositionRow from "./positionRow";
import usePositionHistory from "@/hooks/usePositionsHistory";
import Placeholder from "../tablePlaceholder";
import { Outcome, ParticipatedCampaign } from "@/types";
import { useAppKitAccount } from "@reown/appkit/react";

export default function PositionsGroup({
  content,
  detailPage,
  colSpan,
  hideSmallBalances,
}: ParticipatedCampaign & {
  content: NonNullable<ParticipatedCampaign["content"]>;
  detailPage?: boolean;
  colSpan: number;
  hideSmallBalances: boolean;
}) {
  const account = useAppKitAccount();
  const {
    isLoading,
    isError,
    error,
    data: positions,
  } = usePositions({
    tradingAddr: content.poolAddress as `0x${string}`,
    outcomes: content.outcomes as Outcome[],
    address: account.address,
    isDpm: content?.isDpm,
  });
  const { data: sharePrices } = useSharePrices({
    tradingAddr: content.poolAddress as `0x${string}`,
    outcomeIds: content.outcomes.map((o) => o.identifier) as `0x${string}`[],
    enabled: !content.winner,
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
        data={item}
        price={sharePrices?.find((o) => o.id === item.id)?.price}
        history={positionsHistory?.filter((p) => p.outcomeId === item.id)}
        detailPage={detailPage}
      />
    ));
}
