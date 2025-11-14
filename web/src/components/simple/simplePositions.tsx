"use client";

import usePositions from "@/hooks/usePositions";
import { Outcome, SimpleCampaignDetail } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import SimplePositionRow from "./simplePositionRow";
import useFinalPrice from "@/hooks/useFinalPrice";

export default function SimplePositions({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const account = useActiveAccount();
  const { data: positions } = usePositions({
    tradingAddr: data.poolAddress,
    outcomes: data.outcomes,
    account,
    isDpm: false,
  });
  const winnerOutcome = data.outcomes.find(
    (o) => o.identifier === data?.winner,
  ) as Outcome;
  const { data: finalPrice } = useFinalPrice({
    symbol: data.priceMetadata.baseAsset,
    starting: data.starting,
    ending: data.ending,
  });
  const basePrice = Number(data.priceMetadata.priceTargetForUp);
  if (positions && positions.length > 0)
    return (
      <div className="flex flex-col gap-2">
        {positions.map((p) => (
          <SimplePositionRow
            isConcluded={!!winnerOutcome}
            isPriceAbove={finalPrice ? finalPrice.price > basePrice : false}
            key={p.id}
            position={p}
            account={account}
            tradingAddr={data.poolAddress}
          />
        ))}
      </div>
    );

  return null;
}
