"use client";

import { SimpleCampaignDetail } from "@/types";
import getDppmPrices from "@/utils/getDppmPrices";

export default function SimpleChance({ data }: { data: SimpleCampaignDetail }) {
  const sharePrices = getDppmPrices(data.odds);

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
