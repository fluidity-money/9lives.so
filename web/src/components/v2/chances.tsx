"use client";

import useSharePrices from "@/hooks/useSharePrices";
import { SimpleCampaignDetail } from "@/types";

export default function SimpleChance({ data }: { data: SimpleCampaignDetail }) {
  const { data: sharePrices, isLoading } = useSharePrices({
    tradingAddr: data.poolAddress as `0x${string}`,
    outcomeIds: data.outcomes.map((o) => o.identifier as `0x${string}`),
  });
  const chance = (index: number) =>
    (Number(sharePrices ? sharePrices[index].price : 0.5) * 100).toFixed(0);
  const yes = chance(1);
  const no = chance(0);
  return (
    <div className="mb-4 flex flex-col gap-1">
      <p className="text-xs font-semibold text-neutral-400">
        Overview Outcome Projection
      </p>
      {isLoading ? (
        <div className="skeleton h-[30px] w-full" />
      ) : (
        <div className="relative flex flex-row items-center gap-0.5">
          <span className="font-sm absolute left-1.5 top-[3px] font-bold text-green-700">
            {yes}%
          </span>
          <div
            className="flex h-[30px] rounded-md bg-green-300"
            style={{ flex: yes }}
          />
          <div
            className="flex h-[30px] rounded-md bg-red-300"
            style={{ flex: no }}
          />
          <span className="font-sm absolute right-1.5 top-[3px] font-bold text-red-700">
            {no}%
          </span>
        </div>
      )}
    </div>
  );
}
