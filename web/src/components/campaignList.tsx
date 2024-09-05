"use client";
import { CampaignListQuery } from "@/gql/graphql";
import { useQuery } from "@tanstack/react-query";

export default function CampaignList() {
  const { data, isLoading } = useQuery<CampaignListQuery>({
    queryKey: ["campaigns"],
  });
  if (isLoading) return <div>Loading...</div>;

  if (!data || !data?.campaigns.length) return <div>No item</div>;

  return data?.campaigns.map((campaign) => (
    <div key={campaign.identifier}>{campaign.name}</div>
  ));
}
