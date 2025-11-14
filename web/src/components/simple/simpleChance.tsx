"use client";

import useSharePrices from "@/hooks/useSharePrices";
import { SimpleCampaignDetail } from "@/types";

export default function SimpleChance({ data }: { data: SimpleCampaignDetail }) {
  const isEnded = Date.now() > data.ending;
  const { data: sharePrices } = useSharePrices({
    tradingAddr: data.poolAddress as `0x${string}`,
    outcomeIds: data.outcomes.map((o) => o.identifier as `0x${string}`),
  });

  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-chicago text-sm">
        {(Number(sharePrices ? sharePrices[1].price : 0.5) * 100).toFixed(0)}%
      </span>
      <div className="h-2 flex-1 bg-9red">
        <div
          className="h-2 bg-9green"
          style={{
            width: `${Number(sharePrices ? sharePrices[1].price : 0.5) * 100}%`,
          }}
        />
      </div>
      <span className="font-chicago text-sm">
        {(Number(sharePrices ? sharePrices[0].price : 0.5) * 100).toFixed(0)}%
      </span>
    </div>
  );
}
