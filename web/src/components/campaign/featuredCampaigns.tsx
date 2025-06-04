"use client";
import useFeaturedCampaigns from "@/hooks/useFeaturedCampaigns";
import ErrorIndicator from "../errorIndicator";
import LoadingIndicator from "../loadingIndicator";
import { useDegenStore } from "@/stores/degenStore";
import { combineClass } from "@/utils/combineClass";
import CampaignItem from "./campaignItem";

export default function FeaturedCampaign() {
  const { data: campaigns, isError, isLoading } = useFeaturedCampaigns();
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);

  if (isError) return <ErrorIndicator />;

  if (isLoading) return <LoadingIndicator />;

  return (
    <div
      className={combineClass(
        "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4",
        !isDegenModeEnabled && "sm:grid-cols-2",
      )}
    >
      {campaigns?.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}
