"use client";

import { SimpleCampaignDetail } from "@/types";
import CountdownTimer from "../countdownTimer";
import { useQuery } from "@tanstack/react-query";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import isMarketOpen from "@/utils/isMarketOpen";
import config from "@/config";

export default function SimpleHeader({
  initialData,
}: {
  initialData: SimpleCampaignDetail;
}) {
  const period = getPeriodOfCampaign(initialData);
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", initialData.priceMetadata.baseAsset, period],
    initialData,
  });
  const isHourlyMarket = data.ending - data.starting >= 1000 * 60 * 59;
  const isOpen = isMarketOpen(
    config.simpleMarkets[initialData.priceMetadata.baseAsset],
  );

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
      <div className="flex items-center gap-1 text-xs">
        <span className="font-geneva uppercase text-[#808080]">
          {new Date(data.starting).toLocaleString("default", {
            hour: "numeric",
            minute: isHourlyMarket ? undefined : "2-digit",
            timeZone: "UTC",
          })}{" "}
          -{" "}
          {new Date(data.ending).toLocaleString("default", {
            hour: "numeric",
            minute: isHourlyMarket ? undefined : "2-digit",
            timeZone: "UTC",
          })}
          {" UTC"}
        </span>
        {isOpen ? (
          <CountdownTimer endTime={data.ending} />
        ) : (
          <span className="bg-9red px-0.5 py-px text-9black">Closed</span>
        )}
      </div>
    </div>
  );
}
