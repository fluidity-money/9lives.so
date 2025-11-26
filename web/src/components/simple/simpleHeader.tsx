"use client";

import { SimpleCampaignDetail } from "@/types";
import CountdownTimer from "../countdownTimer";
import { useQuery } from "@tanstack/react-query";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";

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

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
      <div className="flex items-center gap-1 text-xs">
        <span className="font-geneva uppercase text-[#808080]">
          {new Date(data.starting).toLocaleString("default", {
            hour: "numeric",
            timeZone: "UTC",
          })}{" "}
          -{" "}
          {new Date(data.ending).toLocaleString("default", {
            hour: "numeric",
            timeZone: "UTC",
          })}
          {" UTC"}
        </span>
        <CountdownTimer endTime={data.ending} />
      </div>
    </div>
  );
}
