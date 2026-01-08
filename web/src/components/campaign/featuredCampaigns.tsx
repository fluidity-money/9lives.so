"use client";
import useFeaturedCampaigns from "@/hooks/useFeaturedCampaigns";
import ErrorIndicator from "../errorIndicator";
import LoadingIndicator from "../loadingIndicator";
import CampaignItem from "./campaignItem";

export default function FeaturedCampaign() {
  const { data: campaigns, isError, isLoading } = useFeaturedCampaigns();

  if (isError) return <ErrorIndicator />;

  if (isLoading) return <LoadingIndicator />;

  return (
    <div
      className={
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {campaigns?.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}
