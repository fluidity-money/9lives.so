"use client";

import usePositions from "@/hooks/usePositions";
import { Outcome, SimpleCampaignDetail } from "@/types";
import SimplePositionRow from "./simplePositionRow";
import useFinalPrice from "@/hooks/useFinalPrice";
import { useAppKitAccount } from "@reown/appkit/react";

export default function SimplePositions({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const account = useAppKitAccount();
  const { data: positions } = usePositions({
    tradingAddr: data.poolAddress,
    outcomes: data.outcomes,
    address: account.address,
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
            isPriceAbove={finalPrice ? finalPrice > basePrice : false}
            key={p.id}
            position={p}
            address={account.address}
            tradingAddr={data.poolAddress}
          />
        ))}
      </div>
    );

  return null;
}
