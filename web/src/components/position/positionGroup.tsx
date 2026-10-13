"use client";

import usePositions from "@/hooks/usePositions";
import PositionRow from "./positionRow";
import usePositionHistory from "@/hooks/usePositionsHistory";
import Placeholder from "../tablePlaceholder";
import { Outcome, ParticipatedCampaign } from "@/types";
import { useAppKitAccount } from "@reown/appkit/react";
import getDppmPrices from "@/utils/getDppmPrices";
import getAmmPrices from "@/utils/getAmmPrices";

export default function PositionsGroup({
  content,
  detailPage,
  colSpan,
  hideSmallBalances,
  modern = false,
}: ParticipatedCampaign & {
  content: NonNullable<ParticipatedCampaign["content"]>;
  detailPage?: boolean;
  colSpan: number;
  hideSmallBalances: boolean;
  modern?: boolean;
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
  const dppmPrices = getDppmPrices(content.odds, content.outcomes);
  const ammPrices = Object.entries(getAmmPrices(content.shares) ?? {}).map(
    ([k, v]) => ({ id: k, price: v }),
  );
  const sharePrices = content.isDppm ? dppmPrices : ammPrices;
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
        modern={modern}
      />
    );
  if (isError)
    return (
      <Placeholder
        colSpan={colSpan}
        title="Whoops, error!"
        subtitle={error.message}
        height={!detailPage ? "min-h-20" : undefined}
        modern={modern}
      />
    );
  if (detailPage && positions?.length === 0)
    return (
      <Placeholder
        colSpan={colSpan}
        title="Nothing yet."
        subtitle="Start Growing Your Portfolio."
        modern={modern}
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
        modern={modern}
      />
    ));
}
