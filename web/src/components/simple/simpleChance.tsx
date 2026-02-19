"use client";

import { SimpleCampaignDetail } from "@/types";
import getDppmPrices from "@/utils/getDppmPrices";

export default function SimpleChance({ data }: { data: SimpleCampaignDetail }) {
  const dppmPrices = getDppmPrices(data.odds);
  const sharePrices =
    dppmPrices.length === 2
      ? getDppmPrices(data.odds)
      : [
          { id: data.outcomes[0].identifier, price: 0.5 },
          { id: data.outcomes[1].identifier, price: 0.5 },
        ];
  const id = (outcomeName: "Up" | "Down") =>
    data.outcomes.find((o) => o.name === outcomeName)?.identifier;
  const chance = (outcomeName: "Up" | "Down") =>
    (
      Number(
        sharePrices.find((sp) => sp.id === id(outcomeName))?.price ?? 0.5,
      ) * 100
    ).toFixed(0);
  const yesChance = chance("Up");
  const noChance = chance("Down");
  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-chicago text-sm">{yesChance}%</span>
      <div className="h-2 flex-1 bg-9red">
        <div
          className="h-2 bg-9green"
          style={{
            width: `${yesChance}%`,
          }}
        />
      </div>
      <span className="font-chicago text-sm">{noChance}%</span>
    </div>
  );
}
