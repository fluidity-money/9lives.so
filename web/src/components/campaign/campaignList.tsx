"use client";
import { CampaignListQuery } from "@/gql/graphql";
import { useQuery } from "@tanstack/react-query";
import CampaignItem from "./campaignItem";

export default function CampaignList() {
  const { data, isLoading } = useQuery<CampaignListQuery>({
    queryKey: ["campaigns"],
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data || !data?.campaigns.length) return <div>No item</div>;

  const mockData = [
    ...data.campaigns,
    ...data.campaigns.map((item) => ({
      ...item,
      outcomes: [item.outcomes[0]],
    })),
    ...data.campaigns,
    ...data.campaigns,
    ...data.campaigns,
    ...data.campaigns,
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {mockData.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}
