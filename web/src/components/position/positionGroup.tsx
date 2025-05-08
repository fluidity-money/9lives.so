"use client";

import { PositionsProps } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import usePositions from "@/hooks/usePositions";
import useSharePrices from "@/hooks/useSharePrices";
import PositionRow from "./positionRow";
import usePositionHistory from "@/hooks/usePositionsHistory";
import Placeholder from "../tablePlaceholder";
import useIsDpm from "@/hooks/useIsDpm";

export default function PositionsGroup({
  tradingAddr,
  outcomes,
  campaignName,
  campaignId,
  winner,
  detailPage,
  isDpm,
  colSpan,
}: PositionsProps & {
  detailPage?: boolean;
  isDpm?: boolean;
  colSpan: number;
}) {
  const account = useActiveAccount();
  const {
    isLoading,
    isError,
    error,
    data: positions,
  } = usePositions({
    tradingAddr,
    outcomes,
    account,
  });
  const outcomeIds = outcomes.map((o) => o.identifier);
  const { data: sharePrices } = useSharePrices({
    tradingAddr,
    outcomeIds,
  });
  const { data: positionsHistory } = usePositionHistory(
    account?.address,
    positions?.map((p) => p.id),
  );
  const { data: groupCheckedIsDpm } = useIsDpm(tradingAddr, {
    initialData: isDpm,
  });

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
  return (
    <>
      {positions?.map((item, idx) => (
        <PositionRow
          key={idx}
          isDpm={groupCheckedIsDpm}
          data={{ ...item, campaignName, campaignId, winner }}
          price={sharePrices?.find((o) => o.id === item.id)?.price}
          history={positionsHistory?.filter((p) => p.id === item.id)}
          tradingAddr={tradingAddr}
          outcomes={outcomes}
          detailPage={detailPage}
        />
      ))}
    </>
  );
}
