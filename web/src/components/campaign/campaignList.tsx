"use client";
import { Campaign } from "@/types";
import CampaignItem from "./campaignItem";
import { useQuery } from "@tanstack/react-query";

export default function CampaignList() {
  const { data } = useQuery<Campaign[]>({ queryKey: ["campaigns"] });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {data?.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}
