"use client";
import CampaignItem from "./campaignItem";
import LoadingIndicator from "../loadingIndicator";
import ErrorIndicator from "../errorIndicator";
import useTimebasedCampaigns from "@/hooks/useTimebasedCampaigns";
import config from "@/config";

export default function TimebasedCampaignList({
  category,
}: {
  category: string;
}) {
  const tokens = Object.values(config.simpleMarkets).map((c) =>
    c.slug.toUpperCase(),
  );
  const {
    data: campaigns,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useTimebasedCampaigns(["Price Prediction", category], tokens);

  if (isError) {
    return <ErrorIndicator msg={error.message} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isSuccess && campaigns) {
    if (campaigns.length === 0) {
      <div className="flex items-center justify-center">
        <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
          No results found
        </span>
      </div>;
    } else {
      return (
        <>
          <div
            className={
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {campaigns
              ?.filter((c) => !!c)
              .map((campaign) => (
                <CampaignItem key={campaign.identifier} data={campaign} />
              ))}
          </div>
        </>
      );
    }
  }

  return <ErrorIndicator msg={"Unkown error"} />;
}
