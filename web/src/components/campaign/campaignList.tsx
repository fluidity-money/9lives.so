"use client";
import { Campaign } from "@/types";
import CampaignItem from "./campaignItem";
import { useQuery } from "@tanstack/react-query";
import { combineClass } from "@/utils/combineClass";
import { useDegenStore } from "@/stores/degenStore";

export default function CampaignList() {
  const { data } = useQuery<Campaign[]>({ queryKey: ["campaigns"] });
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  return (
    <div
      className={combineClass(
        "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4",
        !isDegenModeEnabled && "sm:grid-cols-2",
      )}
    >
      {data?.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}
